'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import {
  getAppointmentsByDay, getOccupancyByMonth, getConflictsByMonth,
  updateAppointmentStatus, updateAppointment,
  AdminAppointment,
} from '@/lib/admin-data';
import { createStaffClient } from '@/lib/supabase/client';
import { getClinicSettings, generateTimes, DEFAULT_SETTINGS, type ClinicSettings } from '@/lib/clinic-settings';
import { PROCEDURE_CATALOG } from '@/lib/constants';
import NovoAgendamentoModal from '@/components/system/NovoAgendamentoModal';

const TODAY = new Date();
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`;
const YEAR  = TODAY.getFullYear();
const MONTH = TODAY.getMonth() + 1;

function getLocalDateStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

function isSlotPast(dateStr: string, time: string): boolean {
  const todayStr = getLocalDateStr();
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 30;
}

function isDateBlocked(dateStr: string, settings: ClinicSettings): boolean {
  if (settings.blocked_dates.includes(dateStr)) return true;
  const dow = new Date(dateStr + 'T12:00:00').getDay();
  return !settings.active_weekdays.includes(dow);
}

function maskPrice(v: string) {
  const digits = v.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return 'R$ ' + (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function priceToNum(v: string) {
  return parseInt(v.replace(/\D/g, ''), 10) || 0;
}

const WEEKDAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAYS_FULL = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];

function padDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function formatDisplayDate(dateStr: string) {
  const [,, d] = dateStr.split('-');
  const date = new Date(dateStr + 'T12:00:00');
  return `${WEEKDAYS_FULL[date.getDay()]}, ${parseInt(d)} de ${MONTH_NAMES[MONTH - 1].toLowerCase()}`;
}

function formatFullDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(dateStr + 'T12:00:00');
  return `${WEEKDAYS_FULL[date.getDay()]}, ${parseInt(d)} de ${MONTH_NAMES[parseInt(m) - 1]} de ${y}`;
}

function getOccupancyLevel(count: number): string {
  if (!count) return 'empty';
  if (count <= 1) return 'low';
  if (count <= 2) return 'medium';
  return 'high';
}

function buildMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function waLink(phone: string, patient: string) {
  const clean = phone.replace(/\D/g, '');
  const msg = encodeURIComponent(`Olá ${patient}! Entrando em contato da Depill Plus.`);
  return `https://wa.me/55${clean}?text=${msg}`;
}

const STATUS_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

type DetailMode = 'view' | 'reschedule' | 'edit';

export default function AgendaPage() {
  const [selectedDay, setSelectedDay] = useState<number>(TODAY.getDate());
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalTime, setModalTime]     = useState<string>('');
  const [refreshKey, setRefreshKey]   = useState(0);

  // Detail modal state
  const [detailApt,   setDetailApt]   = useState<AdminAppointment | null>(null);
  const [detailMode,  setDetailMode]  = useState<DetailMode>('view');
  const [detailError, setDetailError] = useState('');

  // Reschedule state
  const [reschedDate,         setReschedDate]         = useState('');
  const [reschedTime,         setReschedTime]         = useState('');
  const [reschedBookedTimes,  setReschedBookedTimes]  = useState<Set<string>>(new Set());
  const [reschedLoadingSlots, setReschedLoadingSlots] = useState(false);
  const [reschedSaving,       setReschedSaving]       = useState(false);
  const [reschedCalYear,      setReschedCalYear]       = useState(TODAY.getFullYear());
  const [reschedCalMonth,     setReschedCalMonth]      = useState(TODAY.getMonth());

  // Edit state
  const [editProcIdx, setEditProcIdx] = useState(0);
  const [editPrice,   setEditPrice]   = useState('');
  const [editSaving,  setEditSaving]  = useState(false);

  function openModal(time?: string) {
    setModalTime(time ?? '');
    setModalOpen(true);
  }

  const [settings,  setSettings]          = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const [occupancy, setOccupancy]         = useState<Record<string, number>>({});
  const [conflictDays, setConflictDays]   = useState<Set<string>>(new Set());
  const [loadingOccupancy, setLoadingOcc] = useState(true);
  const [dayApts, setDayApts]             = useState<AdminAppointment[]>([]);
  const [loadingDay, setLoadingDay]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const staffClient = useMemo(() => createStaffClient(), []);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    getClinicSettings(staffClient).then(setSettings);
  }, []);

  // Carrega horários ocupados ao remarcar
  useEffect(() => {
    if (!reschedDate || detailMode !== 'reschedule') return;
    setReschedLoadingSlots(true);
    getAppointmentsByDay(reschedDate, staffClient).then(apts => {
      const booked = new Set(
        apts.filter(a => a.id !== detailApt?.id && a.status !== 'cancelado').map(a => a.time)
      );
      setReschedBookedTimes(booked);
      setReschedLoadingSlots(false);
    });
  }, [reschedDate, detailMode]);

  async function handleApprove(id: string) {
    setActionLoading(true);
    await updateAppointmentStatus(id, 'confirmado', staffClient);
    setActionLoading(false);
    setDetailApt(prev => prev ? { ...prev, status: 'confirmado' } : null);
    refresh();
  }

  async function handleReject(id: string) {
    setActionLoading(true);
    await updateAppointmentStatus(id, 'cancelado', staffClient);
    setActionLoading(false);
    setDetailApt(prev => prev ? { ...prev, status: 'cancelado' } : null);
    refresh();
  }

  async function handleReschedule() {
    if (!detailApt || !reschedDate || !reschedTime) {
      setDetailError('Selecione data e horário.');
      return;
    }
    if (reschedDate < getLocalDateStr()) {
      setDetailError('Não é possível remarcar para uma data passada.');
      return;
    }
    if (isDateBlocked(reschedDate, settings)) {
      setDetailError('Esta data está bloqueada.');
      return;
    }
    if (isSlotPast(reschedDate, reschedTime)) {
      setDetailError('Este horário já passou.');
      setReschedTime('');
      return;
    }
    if (reschedBookedTimes.has(reschedTime)) {
      setDetailError('Este horário está ocupado.');
      setReschedTime('');
      return;
    }
    setReschedSaving(true);
    const ok = await updateAppointment(detailApt.id, { date: reschedDate, time: reschedTime }, staffClient);
    setReschedSaving(false);
    if (!ok) { setDetailError('Erro ao remarcar. Tente novamente.'); return; }
    setDetailApt(prev => prev ? { ...prev, date: reschedDate, time: reschedTime } : null);
    setDetailMode('view');
    setDetailError('');
    refresh();
  }

  async function handleEditSave() {
    if (!detailApt) return;
    const proc = PROCEDURE_CATALOG[editProcIdx];
    const finalPrice   = editPrice || proc.price;
    const finalPriceNum = priceToNum(editPrice) || proc.priceNum;
    setEditSaving(true);
    const ok = await updateAppointment(detailApt.id, {
      procedure: proc.name,
      price:     finalPrice,
      priceNum:  finalPriceNum,
    }, staffClient);
    setEditSaving(false);
    if (!ok) { setDetailError('Erro ao salvar. Tente novamente.'); return; }
    setDetailApt(prev => prev ? { ...prev, procedure: proc.name, price: finalPrice } : null);
    setDetailMode('view');
    setDetailError('');
    refresh();
  }

  function openReschedule() {
    if (!detailApt) return;
    const [y, m] = detailApt.date.split('-').map(Number);
    setReschedCalYear(y);
    setReschedCalMonth(m - 1);
    setReschedDate(detailApt.date);
    setReschedTime(detailApt.time);
    setDetailError('');
    setDetailMode('reschedule');
  }

  function reschedToDateStr(d: number) {
    return `${reschedCalYear}-${String(reschedCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function reschedIsDayDisabled(d: number) {
    const ds  = reschedToDateStr(d);
    const dow = new Date(`${ds}T12:00:00`).getDay();
    if (ds < getLocalDateStr()) return true;
    if (!settings.active_weekdays.includes(dow)) return true;
    if (settings.blocked_dates.includes(ds)) return true;
    return false;
  }

  function reschedPrevMonth() {
    if (!reschedCanGoPrev) return;
    if (reschedCalMonth === 0) { setReschedCalYear(y => y - 1); setReschedCalMonth(11); }
    else setReschedCalMonth(m => m - 1);
  }

  function reschedNextMonth() {
    if (reschedCalMonth === 11) { setReschedCalYear(y => y + 1); setReschedCalMonth(0); }
    else setReschedCalMonth(m => m + 1);
  }

  function openEdit() {
    if (!detailApt) return;
    const idx = PROCEDURE_CATALOG.findIndex(p => p.name === detailApt.procedure);
    setEditProcIdx(idx >= 0 ? idx : 0);
    setEditPrice(detailApt.price);
    setDetailError('');
    setDetailMode('edit');
  }

  function closeDetail() {
    setDetailApt(null);
    setDetailMode('view');
    setDetailError('');
  }

  function openDetailApt(apt: AdminAppointment) {
    setDetailApt(apt);
    setDetailMode('view');
    setDetailError('');
  }

  useEffect(() => {
    setLoadingOcc(true);
    getOccupancyByMonth(YEAR, MONTH, staffClient).then(data => {
      setOccupancy(data);
      setLoadingOcc(false);
    });
  }, [refreshKey]);

  const allTimes = useMemo(
    () => generateTimes(settings.start_hour, settings.end_hour, settings.slot_interval),
    [settings]
  );

  const allTimesSet = useMemo(() => new Set(allTimes), [allTimes]);

  useEffect(() => {
    if (!settings || settings === DEFAULT_SETTINGS) return;
    getConflictsByMonth(
      YEAR, MONTH,
      allTimesSet,
      settings.blocked_dates,
      settings.active_weekdays,
      staffClient
    ).then(setConflictDays);
  }, [refreshKey, allTimesSet, settings]);

  useEffect(() => {
    const dateStr = padDate(YEAR, MONTH, selectedDay);
    setLoadingDay(true);
    getAppointmentsByDay(dateStr, staffClient).then(apts => {
      setDayApts(apts);
      setLoadingDay(false);
    });
  }, [selectedDay, refreshKey]);

  const days = buildMonthDays(YEAR, MONTH);
  const selectedDateStr = padDate(YEAR, MONTH, selectedDay);

  const aptsByTime: Record<string, AdminAppointment> = {};
  for (const a of dayApts) aptsByTime[a.time] = a;

  // Orphan times: appointments that exist outside the current slot grid → show at the bottom
  const displayTimes = useMemo(() => {
    const orphans = dayApts
      .map(a => a.time)
      .filter(t => !allTimesSet.has(t))
      .sort();
    return [...allTimes, ...orphans];
  }, [allTimes, allTimesSet, dayApts]);

  const hasOrphans = displayTimes.length > allTimes.length;

  // Horários disponíveis para remarcar (grid normal, filtrando já ocupados e passados)
  const reschedAvailTimes = useMemo(() => {
    const todayLocal = getLocalDateStr();
    return allTimes.filter(t => {
      if (reschedBookedTimes.has(t)) return false;
      if (reschedDate === todayLocal) {
        const now = new Date();
        const [h, m] = t.split(':').map(Number);
        if (h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 30) return false;
      }
      return true;
    });
  }, [allTimes, reschedBookedTimes, reschedDate]);

  const reschedCalDays = useMemo(
    () => buildMonthDays(reschedCalYear, reschedCalMonth + 1),
    [reschedCalYear, reschedCalMonth]
  );
  const reschedCanGoPrev =
    reschedCalYear > TODAY.getFullYear() ||
    (reschedCalYear === TODAY.getFullYear() && reschedCalMonth > TODAY.getMonth());

  return (
    <div className="admin-section agenda-page">
      <div className="agenda-header">
        <div>
          <h2 className="admin-section-title">Agenda</h2>
          <p className="admin-section-sub">{MONTH_NAMES[MONTH - 1]} {YEAR} · clique em um dia para ver os horários</p>
        </div>
        <button className="agenda-new-btn" onClick={() => openModal()}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Agendamento
        </button>
      </div>

      <div className="agenda-layout">
        {/* Calendar */}
        <div className="admin-cal">
          <div className="admin-cal-month">{MONTH_NAMES[MONTH - 1]} {YEAR}</div>
          <div className={`admin-cal-grid${loadingOccupancy ? ' loading' : ''}`}>
            {WEEKDAY_HEADERS.map(h => (
              <div key={h} className="admin-cal-wday">{h}</div>
            ))}
            {days.map((d, i) => {
              if (!d) return <div key={`e-${i}`} className="admin-cal-day empty" />;
              const dateStr    = padDate(YEAR, MONTH, d);
              const count      = occupancy[dateStr] || 0;
              const level      = getOccupancyLevel(count);
              const isToday    = dateStr === TODAY_STR;
              const isSel      = d === selectedDay;
              const isPast     = dateStr < TODAY_STR;
              const hasConflict = conflictDays.has(dateStr);
              const isInactive = !isPast && isDateBlocked(dateStr, settings);
              const isBlocked  = !isPast && settings.blocked_dates.includes(dateStr);
              return (
                <button
                  key={d}
                  className={[
                    'admin-cal-day',
                    level,
                    isToday    ? 'today'    : '',
                    isSel      ? 'selected' : '',
                    isPast     ? 'past'     : '',
                    hasConflict ? 'conflict' : '',
                    isInactive ? 'inactive' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedDay(d)}
                  title={isBlocked ? 'Data bloqueada' : isInactive ? 'Dia sem atendimento' : undefined}
                >
                  <span className="admin-cal-day-n">{d}</span>
                  {count > 0 && (
                    <span className="admin-cal-occ">
                      {Array.from({ length: Math.min(count, 4) }).map((_, j) => (
                        <span key={j} className="admin-cal-occ-bar" />
                      ))}
                    </span>
                  )}
                  {hasConflict && <span className="admin-cal-conflict-dot" title="Agendamento fora do horário" />}
                </button>
              );
            })}
          </div>
          <div className="admin-cal-legend">
            <span className="admin-cal-legend-item"><span className="admin-cal-legend-dot low" /> 1 ag.</span>
            <span className="admin-cal-legend-item"><span className="admin-cal-legend-dot medium" /> 2 ag.</span>
            <span className="admin-cal-legend-item"><span className="admin-cal-legend-dot high" /> 3+ ag.</span>
            <span className="admin-cal-legend-item"><span className="admin-cal-legend-dot inactive-dot" /> sem atendimento</span>
            <span className="admin-cal-legend-item"><span className="admin-cal-conflict-dot" style={{position:'static',transform:'none',marginRight:2}} /> fora do horário</span>
          </div>
        </div>

        {/* Day panel */}
        <div className="agenda-day-panel">
          <div className="agenda-day-header">
            <h3 className="agenda-day-title">{formatDisplayDate(selectedDateStr)}</h3>
            <div className="agenda-day-actions">
              <span className="admin-day-panel-count">
                {loadingDay ? '...' : `${dayApts.length} ${dayApts.length === 1 ? 'agendamento' : 'agendamentos'}`}
              </span>
              <button
                className="agenda-add-day-btn"
                onClick={() => openModal()}
                title="Novo agendamento neste dia"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="agenda-slots">
            {loadingDay ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="agenda-slot-skeleton" />
              ))
            ) : displayTimes.map((time, idx) => {
              const apt       = aptsByTime[time];
              const isOrphan  = !allTimesSet.has(time);
              const isFirstOrphan = isOrphan && (idx === 0 || allTimesSet.has(displayTimes[idx - 1]));
              const isPast    = isSlotPast(selectedDateStr, time);
              const isBlocked = !isPast && !apt && isDateBlocked(selectedDateStr, settings);

              return (
                <Fragment key={time}>
                  {isFirstOrphan && hasOrphans && (
                    <div className="agenda-orphan-divider">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Agendamentos fora do horário atual
                    </div>
                  )}
                  <div className={`agenda-slot${apt ? (isOrphan ? ' busy orphan' : ' busy') : isBlocked ? ' blocked' : ' avail'}`}>
                    <span className="agenda-slot-time">{time}</span>
                    {apt ? (
                      <button
                        className={`agenda-slot-apt clickable${apt.status === 'pendente' ? ' pendente' : ''}`}
                        onClick={() => openDetailApt(apt)}
                      >
                        <div className="agenda-slot-info">
                          <p className="agenda-slot-patient">{apt.patient}</p>
                          <p className="agenda-slot-proc">
                            {apt.procedure}
                            {isOrphan && <span className="agenda-slot-conflict-badge">fora do horário</span>}
                          </p>
                        </div>
                        <div className="agenda-slot-right">
                          <span className="agenda-slot-price">{apt.price}</span>
                          <span className={`admin-day-badge ${apt.status}`}>{apt.status}</span>
                          <svg className="agenda-slot-chevron" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </button>
                    ) : isPast ? (
                      <span className="agenda-slot-past-label">passado</span>
                    ) : isBlocked ? (
                      <span className="agenda-slot-past-label blocked-label">bloqueado</span>
                    ) : (
                      <button
                        className="agenda-slot-empty-btn"
                        onClick={() => openModal(time)}
                        title="Criar agendamento"
                      >
                        <span>disponível</span>
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <NovoAgendamentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDateStr}
        defaultTime={modalTime}
        onSaved={refresh}
        clinicSettings={settings}
      />

      {/* Appointment detail modal */}
      {detailApt && (
        <div className="agenda-detail-overlay" onClick={closeDetail}>
          <div className="agenda-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="agenda-detail-close" onClick={closeDetail} aria-label="Fechar">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* VIEW MODE */}
            {detailMode === 'view' && (
              <>
                <div className="agenda-detail-header">
                  <span className={`admin-day-badge lg ${detailApt.status}`}>{STATUS_LABEL[detailApt.status]}</span>
                  <h3 className="agenda-detail-proc">{detailApt.procedure}</h3>
                  <p className="agenda-detail-date">{formatFullDate(detailApt.date)}</p>
                  {/* Aviso se agendamento está fora do horário atual */}
                  {!allTimesSet.has(detailApt.time) && (
                    <div className="agenda-detail-conflict">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Este horário está fora da grade atual. Considere remarcar.
                    </div>
                  )}
                </div>

                <div className="agenda-detail-grid">
                  <div className="agenda-detail-item">
                    <span className="agenda-detail-label">Paciente</span>
                    <span className="agenda-detail-value">{detailApt.patient}</span>
                  </div>
                  <div className="agenda-detail-item">
                    <span className="agenda-detail-label">Horário</span>
                    <span className="agenda-detail-value">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {detailApt.time}
                    </span>
                  </div>
                  <div className="agenda-detail-item">
                    <span className="agenda-detail-label">Valor</span>
                    <span className="agenda-detail-value accent">{detailApt.price}</span>
                  </div>
                  {detailApt.phone && (
                    <div className="agenda-detail-item">
                      <span className="agenda-detail-label">Telefone</span>
                      <span className="agenda-detail-value">{detailApt.phone}</span>
                    </div>
                  )}
                </div>

                <div className="agenda-detail-actions">
                  {detailApt.phone && (
                    <a
                      href={waLink(detailApt.phone, detailApt.patient)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agenda-detail-wa"
                    >
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}

                  <button className="agenda-detail-action-btn" onClick={openReschedule}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Remarcar
                  </button>

                  <button className="agenda-detail-action-btn" onClick={openEdit}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </button>

                  {detailApt.status === 'pendente' && (
                    <>
                      <button
                        className="agenda-approve-btn lg"
                        onClick={() => handleApprove(detailApt.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <span className="login-spinner" style={{ width: 12, height: 12 }} />
                        ) : (
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        Aprovar
                      </button>
                      <button
                        className="agenda-reject-btn lg"
                        onClick={() => handleReject(detailApt.id)}
                        disabled={actionLoading}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Recusar
                      </button>
                    </>
                  )}

                  <button className="agenda-detail-close-btn" onClick={closeDetail}>
                    Fechar
                  </button>
                </div>
              </>
            )}

            {/* RESCHEDULE MODE */}
            {detailMode === 'reschedule' && (
              <>
                <div className="agenda-detail-header">
                  <p className="agenda-detail-back-label">Remarcar agendamento</p>
                  <h3 className="agenda-detail-proc">{detailApt.patient}</h3>
                  <p className="agenda-detail-date">{detailApt.procedure}</p>
                </div>

                <div className="agenda-reschedule-form">
                  <div className="agenda-reschedule-date-row">
                    <label className="na-label">Nova data</label>
                    <div className="clt-cal na-mini-cal">
                      <div className="clt-cal-nav-row">
                        <button type="button" className="clt-cal-arrow" onClick={reschedPrevMonth} disabled={!reschedCanGoPrev}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M15 18l-6-6 6-6"/>
                          </svg>
                        </button>
                        <span className="clt-cal-month-label">{MONTH_NAMES[reschedCalMonth]} {reschedCalYear}</span>
                        <button type="button" className="clt-cal-arrow" onClick={reschedNextMonth}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </button>
                      </div>
                      <div className="clt-cal-grid">
                        {WEEKDAY_HEADERS.map(w => (
                          <div key={w} className="clt-cal-wday">{w}</div>
                        ))}
                        {reschedCalDays.map((d, i) => {
                          if (!d) return <div key={`e-${i}`} className="clt-cal-day empty" />;
                          const disabled = reschedIsDayDisabled(d);
                          const ds       = reschedToDateStr(d);
                          const selected = ds === reschedDate;
                          const isToday  = ds === getLocalDateStr();
                          return (
                            <button
                              type="button"
                              key={d}
                              disabled={disabled}
                              onClick={() => { setReschedDate(ds); setReschedTime(''); setDetailError(''); }}
                              className={['clt-cal-day', disabled ? 'disabled' : '', selected ? 'selected' : '', isToday ? 'today' : ''].filter(Boolean).join(' ')}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {reschedDate && (
                    <div className="agenda-reschedule-times-section">
                      <p className="agenda-reschedule-times-label">
                        {reschedLoadingSlots ? 'Verificando disponibilidade...' : 'Selecione o horário'}
                      </p>
                      {!reschedLoadingSlots && (
                        <div className="agenda-reschedule-time-grid">
                          {allTimes.map(t => {
                            const booked   = reschedBookedTimes.has(t);
                            const isPast   = isSlotPast(reschedDate, t);
                            const blocked  = booked || isPast;
                            const selected = t === reschedTime;
                            return (
                              <button
                                key={t}
                                disabled={blocked}
                                onClick={() => { setReschedTime(t); setDetailError(''); }}
                                className={['agenda-rtime-btn', blocked ? 'busy' : 'avail', selected ? 'selected' : ''].filter(Boolean).join(' ')}
                              >
                                {t}
                              </button>
                            );
                          })}
                          {reschedAvailTimes.length === 0 && (
                            <p className="agenda-reschedule-empty">Sem horários disponíveis neste dia.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {detailError && (
                    <p className="na-error" style={{ margin: '0 0 4px' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {detailError}
                    </p>
                  )}
                </div>

                <div className="agenda-detail-actions">
                  <button className="agenda-detail-close-btn" onClick={() => { setDetailMode('view'); setDetailError(''); }} disabled={reschedSaving}>
                    Cancelar
                  </button>
                  <button
                    className="agenda-approve-btn lg"
                    onClick={handleReschedule}
                    disabled={reschedSaving || !reschedDate || !reschedTime}
                    style={{ marginLeft: 'auto' }}
                  >
                    {reschedSaving ? (
                      <span className="login-spinner" style={{ width: 12, height: 12 }} />
                    ) : (
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {reschedSaving ? 'Salvando...' : 'Confirmar remarcação'}
                  </button>
                </div>
              </>
            )}

            {/* EDIT MODE */}
            {detailMode === 'edit' && (
              <>
                <div className="agenda-detail-header">
                  <p className="agenda-detail-back-label">Editar agendamento</p>
                  <h3 className="agenda-detail-proc">{detailApt.patient}</h3>
                  <p className="agenda-detail-date">{detailApt.date} · {detailApt.time}</p>
                </div>

                <div className="agenda-reschedule-form">
                  <div className="agenda-edit-field">
                    <label className="na-label">Procedimento</label>
                    <div className="na-select-wrap">
                      <select
                        className="na-select"
                        value={editProcIdx}
                        onChange={e => {
                          const idx = Number(e.target.value);
                          setEditProcIdx(idx);
                          setEditPrice(PROCEDURE_CATALOG[idx].price);
                        }}
                      >
                        {PROCEDURE_CATALOG.map((p, i) => (
                          <option key={p.name} value={i}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="agenda-edit-field">
                    <label className="na-label">Valor cobrado</label>
                    <input
                      className="na-input"
                      placeholder="R$ 0,00"
                      value={editPrice}
                      onChange={e => setEditPrice(maskPrice(e.target.value))}
                      inputMode="numeric"
                    />
                    <span className="agenda-edit-hint">Sugerido: {PROCEDURE_CATALOG[editProcIdx].price}</span>
                  </div>

                  {detailError && (
                    <p className="na-error" style={{ margin: '0 0 4px' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {detailError}
                    </p>
                  )}
                </div>

                <div className="agenda-detail-actions">
                  <button className="agenda-detail-close-btn" onClick={() => { setDetailMode('view'); setDetailError(''); }} disabled={editSaving}>
                    Cancelar
                  </button>
                  <button
                    className="agenda-approve-btn lg"
                    onClick={handleEditSave}
                    disabled={editSaving}
                    style={{ marginLeft: 'auto' }}
                  >
                    {editSaving ? (
                      <span className="login-spinner" style={{ width: 12, height: 12 }} />
                    ) : (
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {editSaving ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
