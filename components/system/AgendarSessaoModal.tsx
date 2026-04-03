'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { PROCEDURE_CATALOG } from '@/lib/constants';
import { getAppointmentsByDay, addAppointment } from '@/lib/admin-data';
import {
  fetchClinicSettingsPublic,
  generateTimes,
  DEFAULT_SETTINGS,
  type ClinicSettings,
} from '@/lib/clinic-settings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function getLocalDateStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

function isTimePast(dateStr: string, time: string) {
  const todayStr = getLocalDateStr();
  if (dateStr !== todayStr) return false;
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 30;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function buildCalendar(year: number, month: number): (number | null)[] {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function AgendarSessaoModal({ isOpen, onClose, onSaved }: Props) {
  const { user } = useAuth();

  const now = new Date();
  const [settings,     setSettings]     = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const [step,         setStep]         = useState<'procedure' | 'datetime'>('procedure');
  const [procIdx,      setProcIdx]      = useState(0);
  const [calYear,      setCalYear]      = useState(now.getFullYear());
  const [calMonth,     setCalMonth]     = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes,  setBookedTimes]  = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error,        setError]        = useState('');
  const [saving,       setSaving]       = useState(false);

  // Carrega configurações da clínica (via API pública para funcionar sem sessão de staff)
  useEffect(() => {
    fetchClinicSettingsPublic().then(setSettings);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const n = new Date();
      setStep('procedure');
      setProcIdx(0);
      setCalYear(n.getFullYear());
      setCalMonth(n.getMonth());
      setSelectedDate('');
      setSelectedTime('');
      setBookedTimes(new Set());
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Carrega horários ocupados quando data muda
  useEffect(() => {
    if (!selectedDate) { setBookedTimes(new Set()); return; }
    setLoadingSlots(true);
    getAppointmentsByDay(selectedDate).then(apts => {
      setBookedTimes(new Set(apts.filter(a => a.status !== 'cancelado').map(a => a.time)));
      setLoadingSlots(false);
    });
  }, [selectedDate]);

  const procedure  = PROCEDURE_CATALOG[procIdx];
  const allTimes   = useMemo(
    () => generateTimes(settings.start_hour, settings.end_hour, settings.slot_interval),
    [settings]
  );
  const calDays    = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth]);

  function toDateStr(d: number) {
    return `${calYear}-${pad(calMonth + 1)}-${pad(d)}`;
  }

  function isDisabled(d: number) {
    const ds  = toDateStr(d);
    const dow = new Date(`${ds}T12:00:00`).getDay();
    const todayStr = getLocalDateStr();
    if (ds < todayStr) return true;
    if (!settings.active_weekdays.includes(dow)) return true;
    if (settings.blocked_dates.includes(ds)) return true;
    return false;
  }

  const canGoPrev = calYear > now.getFullYear() || calMonth > now.getMonth();

  function prevMonth() {
    if (!canGoPrev) return;
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function selectDay(d: number) {
    if (isDisabled(d)) return;
    setSelectedDate(toDateStr(d));
    setSelectedTime('');
    setError('');
  }

  async function handleConfirm() {
    if (!selectedDate) { setError('Selecione uma data.'); return; }
    if (!selectedTime) { setError('Selecione um horário disponível.'); return; }
    if (isTimePast(selectedDate, selectedTime)) {
      setError('Este horário já passou. Selecione outro.');
      setSelectedTime('');
      return;
    }
    setSaving(true);
    const result = await addAppointment({
      patient:   user!.name,
      phone:     '',
      procedure: procedure.name,
      priceNum:  procedure.priceNum,
      price:     procedure.price,
      date:      selectedDate,
      time:      selectedTime,
      status:    'pendente',
    }, user!.id);
    setSaving(false);
    if (!result) { setError('Erro ao confirmar agendamento. Tente novamente.'); return; }
    onSaved?.();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-modal clt-modal">

        <div className="na-modal-header">
          <div>
            <h2 className="na-modal-title">
              {step === 'procedure' ? 'Escolha o procedimento' : 'Selecione data e horário'}
            </h2>
            <p className="na-modal-sub">
              {step === 'procedure'
                ? 'Selecione o tratamento desejado'
                : `${procedure.name} · ${procedure.price}`}
            </p>
          </div>
          <button className="na-close" onClick={onClose} aria-label="Fechar">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="clt-progress">
          <div className={`clt-step ${step === 'procedure' ? 'active' : 'done'}`}>
            <span className="clt-step-num">
              {step === 'datetime'
                ? <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                : '1'}
            </span>
            Procedimento
          </div>
          <div className="clt-progress-line" />
          <div className={`clt-step ${step === 'datetime' ? 'active' : ''}`}>
            <span className="clt-step-num">2</span>
            Data e horário
          </div>
        </div>

        <div className="na-modal-body">
          {step === 'procedure' && (
            <div className="clt-proc-list">
              {PROCEDURE_CATALOG.map((p, i) => (
                <button
                  key={p.name}
                  className={`clt-proc-item${procIdx === i ? ' active' : ''}`}
                  onClick={() => setProcIdx(i)}
                >
                  <span className="clt-proc-name">{p.name}</span>
                  <span className="clt-proc-price">{p.price}</span>
                  {procIdx === i && (
                    <svg className="clt-proc-check" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 'datetime' && (
            <div className="clt-datetime">
              <div className="clt-cal">
                <div className="clt-cal-nav-row">
                  <button className="clt-cal-arrow" onClick={prevMonth} disabled={!canGoPrev}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <span className="clt-cal-month-label">{MONTHS_PT[calMonth]} {calYear}</span>
                  <button className="clt-cal-arrow" onClick={nextMonth}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
                <div className="clt-cal-grid">
                  {WEEKDAYS.map(w => (
                    <div key={w} className="clt-cal-wday">{w}</div>
                  ))}
                  {calDays.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} className="clt-cal-day empty" />;
                    const disabled = isDisabled(d);
                    const selected = toDateStr(d) === selectedDate;
                    const isToday  = toDateStr(d) === getLocalDateStr();
                    return (
                      <button
                        key={d}
                        disabled={disabled}
                        onClick={() => selectDay(d)}
                        className={['clt-cal-day', disabled ? 'disabled' : '', selected ? 'selected' : '', isToday ? 'today' : ''].filter(Boolean).join(' ')}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="clt-times">
                <p className="clt-times-title">
                  {selectedDate ? (loadingSlots ? 'Carregando...' : 'Horários disponíveis') : 'Selecione uma data'}
                </p>
                {selectedDate && !loadingSlots ? (
                  <>
                    <div className="clt-times-grid">
                      {allTimes.map(t => {
                        const busy    = bookedTimes.has(t);
                        const passed  = isTimePast(selectedDate, t);
                        const blocked = busy || passed;
                        const sel     = t === selectedTime;
                        return (
                          <button
                            key={t}
                            disabled={blocked}
                            onClick={() => { setSelectedTime(t); setError(''); }}
                            className={['clt-time', blocked ? 'busy' : 'avail', sel ? 'selected' : ''].filter(Boolean).join(' ')}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <div className="clt-times-legend">
                      <span><span className="clt-legend avail" />Disponível</span>
                      <span><span className="clt-legend busy" />Ocupado</span>
                    </div>
                  </>
                ) : selectedDate && loadingSlots ? (
                  <p className="clt-times-hint">Verificando disponibilidade...</p>
                ) : (
                  <p className="clt-times-hint">← Clique em um dia no calendário</p>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="na-error">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}
        </div>

        <div className="na-modal-footer">
          {step === 'procedure' ? (
            <>
              <button className="na-cancel" onClick={onClose}>Cancelar</button>
              <button className="na-save" onClick={() => { setStep('datetime'); setError(''); }}>
                Continuar
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <button className="na-cancel" onClick={() => { setStep('procedure'); setError(''); }} disabled={saving}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar
              </button>
              <button
                className="na-save"
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime || saving}
              >
                {saving ? (
                  <span className="login-spinner" style={{ width: 14, height: 14 }} />
                ) : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {saving ? 'Confirmando...' : 'Confirmar agendamento'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
