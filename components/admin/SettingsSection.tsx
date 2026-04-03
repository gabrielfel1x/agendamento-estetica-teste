'use client';

import { useState, useEffect, useMemo } from 'react';
import { createStaffClient } from '@/lib/supabase/client';
import {
  getClinicSettings,
  saveClinicSettings,
  DEFAULT_SETTINGS,
  type ClinicSettings,
} from '@/lib/clinic-settings';

// 0=Dom … 6=Sáb (JS getDay())
const DAYS_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = 6 + i;
  return `${String(h).padStart(2, '0')}:00`;
});

function buildCalendar(year: number, month: number): (number | null)[] {
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function SettingsSection() {
  const staffClient = useMemo(() => createStaffClient(), []);

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');

  // Settings state
  const [activeDays,    setActiveDays]    = useState<number[]>(DEFAULT_SETTINGS.active_weekdays);
  const [startHour,     setStartHour]     = useState(DEFAULT_SETTINGS.start_hour);
  const [endHour,       setEndHour]       = useState(DEFAULT_SETTINGS.end_hour);
  const [blockedDates,  setBlockedDates]  = useState<string[]>(DEFAULT_SETTINGS.blocked_dates);

  // Calendar nav
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Load from Supabase
  useEffect(() => {
    getClinicSettings(staffClient).then(s => {
      setActiveDays(s.active_weekdays);
      setStartHour(s.start_hour);
      setEndHour(s.end_hour);
      setBlockedDates(s.blocked_dates);
      setLoading(false);
    });
  }, []);

  function toggleDay(i: number) {
    setActiveDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i].sort()
    );
  }

  function toggleDate(dateStr: string) {
    setBlockedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort()
    );
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');

    if (startHour >= endHour) {
      setSaveError('O horário de início deve ser anterior ao encerramento.');
      setSaving(false);
      return;
    }

    const settings: ClinicSettings = {
      active_weekdays: activeDays,
      start_hour:      startHour,
      end_hour:        endHour,
      slot_interval:   30,
      blocked_dates:   blockedDates,
    };

    const ok = await saveClinicSettings(settings, staffClient);
    setSaving(false);

    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2800);
    } else {
      setSaveError('Erro ao salvar. Tente novamente.');
    }
  }

  const calDays  = buildCalendar(calYear, calMonth);
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  if (loading) {
    return (
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Configurações</h2>
          <p className="admin-section-sub">Carregando...</p>
        </div>
        <div style={{ display:'flex', gap:16, flexDirection:'column' }}>
          {[1,2,3].map(i => (
            <div key={i} className="admin-settings-card" style={{ height:120, background:'linear-gradient(90deg,var(--border) 25%,var(--ivory-alt) 50%,var(--border) 75%)', backgroundSize:'200% 100%', animation:'skeleton-shimmer 1.4s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Configurações</h2>
        <p className="admin-section-sub">Horários, dias de atendimento e datas bloqueadas</p>
      </div>

      <div className="admin-settings-grid">

        {/* ── Dias de atendimento ── */}
        <div className="admin-settings-card">
          <h3 className="admin-settings-card-title">Dias de atendimento</h3>
          <p className="admin-settings-card-sub">Dias em que a clínica atende</p>
          <div className="admin-day-toggles">
            {DAYS_LABEL.map((d, i) => (
              <button
                key={d}
                className={`admin-day-toggle${activeDays.includes(i) ? ' active' : ''}`}
                onClick={() => toggleDay(i)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* ── Horários de funcionamento ── */}
        <div className="admin-settings-card">
          <h3 className="admin-settings-card-title">Horário de funcionamento</h3>
          <p className="admin-settings-card-sub">Início e encerramento do expediente</p>
          <div className="admin-hour-row">
            <div className="admin-hour-field">
              <label className="admin-hour-label">Início</label>
              <div className="na-select-wrap">
                <select
                  className="admin-hour-select"
                  value={startHour}
                  onChange={e => setStartHour(e.target.value)}
                >
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <span className="admin-hour-sep">até</span>
            <div className="admin-hour-field">
              <label className="admin-hour-label">Encerramento</label>
              <div className="na-select-wrap">
                <select
                  className="admin-hour-select"
                  value={endHour}
                  onChange={e => setEndHour(e.target.value)}
                >
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Datas bloqueadas ── */}
        <div className="admin-settings-card admin-settings-card-wide">
          <h3 className="admin-settings-card-title">Datas bloqueadas</h3>
          <p className="admin-settings-card-sub">
            Clique em um dia para bloquear ou desbloquear.
            {blockedDates.length > 0 && (
              <span className="admin-blocked-count"> {blockedDates.length} {blockedDates.length === 1 ? 'data bloqueada' : 'datas bloqueadas'}</span>
            )}
          </p>

          {/* Calendar nav */}
          <div className="admin-block-cal-header">
            <button className="admin-block-cal-arrow" onClick={prevMonth}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <span className="admin-block-cal-month">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button className="admin-block-cal-arrow" onClick={nextMonth}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          <div className="admin-block-cal">
            {['D','S','T','Q','Q','S','S'].map((h, i) => (
              <span key={i} className="admin-block-wday">{h}</span>
            ))}
            {calDays.map((d, i) => {
              if (!d) return <span key={`e-${i}`} className="admin-block-day empty" />;
              const ds        = toDateStr(calYear, calMonth, d);
              const isBlocked = blockedDates.includes(ds);
              const isToday   = ds === todayStr;
              const isPast    = ds < todayStr;
              const dow       = new Date(`${ds}T12:00:00`).getDay();
              const isInactive = !activeDays.includes(dow);
              return (
                <button
                  key={d}
                  className={[
                    'admin-block-day',
                    isBlocked  ? 'blocked'  : '',
                    isToday    ? 'today'    : '',
                    isPast     ? 'past'     : '',
                    isInactive && !isBlocked ? 'inactive' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => toggleDate(ds)}
                  title={isBlocked ? `Desbloquear ${ds}` : `Bloquear ${ds}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {saveError && (
        <p className="na-error" style={{ marginTop: 16 }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {saveError}
        </p>
      )}

      <div className="admin-settings-save-row">
        <button
          className={`admin-settings-save${saved ? ' saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Salvo com sucesso
            </>
          ) : saving ? (
            <>
              <span className="login-spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,.3)', borderTopColor: 'var(--white)' }} />
              Salvando...
            </>
          ) : (
            'Salvar configurações'
          )}
        </button>
      </div>
    </div>
  );
}
