'use client';

import { useState, useEffect, useMemo } from 'react';
import { PROCEDURE_CATALOG } from '@/lib/constants';
import { addAppointment, getAppointmentsByDay } from '@/lib/admin-data';
import { createStaffClient } from '@/lib/supabase/client';
import { getClinicSettings, generateTimes, DEFAULT_SETTINGS, type ClinicSettings } from '@/lib/clinic-settings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
  onSaved?: () => void;
  clinicSettings?: ClinicSettings;
}

const PAGAMENTOS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Outro'];
const WEEKDAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function getLocalDateStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function isTimePast(dateStr: string, time: string) {
  const todayStr = getLocalDateStr();
  if (dateStr !== todayStr) return dateStr < todayStr;
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 30;
}

function maskPhone(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length === 0) return '';
  if (n.length <= 2)  return `(${n}`;
  if (n.length <= 7)  return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
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

function pad(n: number) { return String(n).padStart(2, '0'); }

function buildCalendar(year: number, month: number): (number | null)[] {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const EMPTY = { name: '', phone: '', procedure: 0, payment: 'Pix', value: '', obs: '', date: '', time: '' };

export default function NovoAgendamentoModal({ isOpen, onClose, defaultDate, defaultTime, onSaved, clinicSettings }: Props) {
  const [settings,  setSettings]  = useState<ClinicSettings>(clinicSettings ?? DEFAULT_SETTINGS);
  const [form, setForm]     = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const staffClient = useMemo(() => createStaffClient(), []);

  // fromSlot = aberto clicando num horário específico na agenda (só se a data não for bloqueada)
  const fromSlot = !!(defaultDate && defaultTime) && form.date === defaultDate && form.time === defaultTime;

  // Booked times state
  const [bookedTimes,  setBookedTimes]  = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Calendar state
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  useEffect(() => {
    if (clinicSettings) { setSettings(clinicSettings); return; }
    getClinicSettings(staffClient).then(setSettings);
  }, [clinicSettings]);

  useEffect(() => {
    if (isOpen) {
      const n = new Date();
      const s = clinicSettings ?? settings;

      // Check if defaultDate is blocked
      let usableDate = defaultDate || '';
      let usableTime = defaultTime || '';
      if (usableDate) {
        const dow = new Date(`${usableDate}T12:00:00`).getDay();
        const todayStr = getLocalDateStr();
        const blocked =
          usableDate < todayStr ||
          !s.active_weekdays.includes(dow) ||
          s.blocked_dates.includes(usableDate);
        if (blocked) {
          usableDate = '';
          usableTime = '';
        }
      }

      setForm({
        ...EMPTY,
        procedure: 0,
        value: PROCEDURE_CATALOG[0].price,
        date: usableDate,
        time: usableTime,
      });
      setErrors({});
      // Reset calendar to current month (or defaultDate month)
      if (defaultDate) {
        const [y, m] = defaultDate.split('-').map(Number);
        setCalYear(y);
        setCalMonth(m - 1);
      } else {
        setCalYear(n.getFullYear());
        setCalMonth(n.getMonth());
      }
    }
  }, [isOpen, defaultDate, defaultTime]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const proc = PROCEDURE_CATALOG[form.procedure];
    if (proc) setForm(f => ({ ...f, value: proc.price }));
  }, [form.procedure]);

  function set(key: string, val: string | number) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  }

  // Carrega horários já ocupados quando a data muda
  useEffect(() => {
    if (!form.date || fromSlot) { setBookedTimes(new Set()); return; }
    setLoadingSlots(true);
    getAppointmentsByDay(form.date, staffClient).then(apts => {
      setBookedTimes(new Set(
        apts.filter(a => a.status !== 'cancelado').map(a => a.time)
      ));
      setLoadingSlots(false);
    });
  }, [form.date]);

  const allTimes = useMemo(
    () => generateTimes(settings.start_hour, settings.end_hour, settings.slot_interval),
    [settings]
  );
  const availableTimes = allTimes.filter(t => !isTimePast(form.date, t) && !bookedTimes.has(t));

  // Calendar helpers
  const calDays = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth]);
  const canGoPrev = calYear > now.getFullYear() || (calYear === now.getFullYear() && calMonth > now.getMonth());

  function toDateStr(d: number) {
    return `${calYear}-${pad(calMonth + 1)}-${pad(d)}`;
  }

  function isDayDisabled(d: number) {
    const ds  = toDateStr(d);
    const dow = new Date(`${ds}T12:00:00`).getDay();
    const todayStr = getLocalDateStr();
    if (ds < todayStr) return true;
    if (!settings.active_weekdays.includes(dow)) return true;
    if (settings.blocked_dates.includes(ds)) return true;
    return false;
  }

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
    if (isDayDisabled(d)) return;
    const ds = toDateStr(d);
    set('date', ds);
    set('time', '');
  }

  // Check if selected date is blocked (for validation)
  function isSelectedDateBlocked() {
    if (!form.date) return false;
    const dow = new Date(`${form.date}T12:00:00`).getDay();
    if (!settings.active_weekdays.includes(dow)) return true;
    if (settings.blocked_dates.includes(form.date)) return true;
    return false;
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim())                errs.name = 'Informe o nome do cliente.';
    else if (form.name.trim().length < 3) errs.name = 'Nome muito curto.';
    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length < 10) errs.phone = 'Telefone incompleto.';
    }
    if (!form.date) errs.date = 'Selecione uma data.';
    else if (form.date < getLocalDateStr()) errs.date = 'Não é possível agendar em data passada.';
    else if (isSelectedDateBlocked()) errs.date = 'Esta data está bloqueada.';
    if (!form.time) errs.time = 'Selecione um horário.';
    else if (isTimePast(form.date, form.time)) errs.time = 'Horário já passou.';
    else if (bookedTimes.has(form.time)) errs.time = 'Horário já ocupado.';
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setErrors({});
    const result = await addAppointment({
      patient:   form.name.trim(),
      phone:     form.phone.replace(/\D/g, ''),
      procedure: PROCEDURE_CATALOG[form.procedure].name,
      priceNum:  priceToNum(form.value),
      price:     form.value || PROCEDURE_CATALOG[form.procedure].price,
      date:      form.date,
      time:      form.time,
      status:    'confirmado',
    }, undefined, staffClient);
    setSaving(false);
    if (!result) { setErrors({ _save: 'Erro ao salvar. Tente novamente.' }); return; }
    onSaved?.();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-modal">
        <div className="na-modal-header">
          <div>
            <h2 className="na-modal-title">Novo Agendamento</h2>
            <p className="na-modal-sub">
              {fromSlot ? `${form.date} · ${form.time}` : 'Preencha os dados do agendamento'}
            </p>
          </div>
          <button className="na-close" onClick={onClose} aria-label="Fechar">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="na-modal-body">
          <div className="na-grid">

            {/* Nome */}
            <div className="na-field na-field-full">
              <label className="na-label">Nome do cliente *</label>
              <input
                className={`na-input${errors.name ? ' na-input-error' : ''}`}
                placeholder="Ex: Maria Silva"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              {errors.name && <span className="na-field-error">{errors.name}</span>}
            </div>

            {/* Telefone */}
            <div className="na-field">
              <label className="na-label">Telefone</label>
              <input
                className={`na-input${errors.phone ? ' na-input-error' : ''}`}
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={e => set('phone', maskPhone(e.target.value))}
                inputMode="numeric"
              />
              {errors.phone && <span className="na-field-error">{errors.phone}</span>}
            </div>

            {/* Procedimento */}
            <div className="na-field">
              <label className="na-label">Procedimento *</label>
              <div className="na-select-wrap">
                <select
                  className="na-select"
                  value={form.procedure}
                  onChange={e => set('procedure', Number(e.target.value))}
                >
                  {PROCEDURE_CATALOG.map((p, i) => (
                    <option key={p.name} value={i}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Data */}
            <div className="na-field na-field-full">
              <label className="na-label">Data *</label>
              {fromSlot ? (
                <input
                  className="na-input na-input-locked"
                  value={form.date}
                  disabled
                />
              ) : (
                <div className="clt-cal na-mini-cal">
                  <div className="clt-cal-nav-row">
                    <button type="button" className="clt-cal-arrow" onClick={prevMonth} disabled={!canGoPrev}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                    <span className="clt-cal-month-label">{MONTHS_PT[calMonth]} {calYear}</span>
                    <button type="button" className="clt-cal-arrow" onClick={nextMonth}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                  <div className="clt-cal-grid">
                    {WEEKDAY_HEADERS.map(w => (
                      <div key={w} className="clt-cal-wday">{w}</div>
                    ))}
                    {calDays.map((d, i) => {
                      if (!d) return <div key={`e-${i}`} className="clt-cal-day empty" />;
                      const disabled = isDayDisabled(d);
                      const selected = toDateStr(d) === form.date;
                      const isToday  = toDateStr(d) === getLocalDateStr();
                      return (
                        <button
                          type="button"
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
              )}
              {errors.date && <span className="na-field-error">{errors.date}</span>}
            </div>

            {/* Horário */}
            <div className="na-field na-field-full">
              <label className="na-label">Horário *</label>
              {fromSlot ? (
                <input
                  className="na-input na-input-locked"
                  value={form.time}
                  disabled
                />
              ) : (
                <div className="na-select-wrap">
                  <select
                    className={`na-select${errors.time ? ' na-input-error' : ''}`}
                    value={form.time}
                    onChange={e => set('time', e.target.value)}
                    disabled={!form.date || loadingSlots}
                  >
                    <option value="">{!form.date ? 'Selecione uma data' : loadingSlots ? 'Carregando...' : 'Selecione'}</option>
                    {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              {errors.time && <span className="na-field-error">{errors.time}</span>}
            </div>

            {/* Valor */}
            <div className="na-field">
              <label className="na-label">Valor</label>
              <input
                className="na-input"
                placeholder="R$ 0,00"
                value={form.value}
                onChange={e => set('value', maskPrice(e.target.value))}
                inputMode="numeric"
              />
            </div>

            {/* Pagamento */}
            <div className="na-field">
              <label className="na-label">Pagamento</label>
              <div className="na-select-wrap">
                <select
                  className="na-select"
                  value={form.payment}
                  onChange={e => set('payment', e.target.value)}
                >
                  {PAGAMENTOS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Observações */}
            <div className="na-field na-field-full">
              <label className="na-label">Observações</label>
              <textarea
                className="na-textarea"
                placeholder="Alguma observação importante..."
                rows={3}
                value={form.obs}
                onChange={e => set('obs', e.target.value)}
              />
            </div>
          </div>

          {errors._save && (
            <p className="na-error" style={{ marginTop: 16 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors._save}
            </p>
          )}
        </div>

        <div className="na-modal-footer">
          <button className="na-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="na-save" onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="login-spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            {saving ? 'Salvando...' : 'Salvar agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
