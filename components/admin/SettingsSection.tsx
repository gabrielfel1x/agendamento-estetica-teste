'use client';

import { useState } from 'react';

const DAYS_ABBR = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = 7 + i;
  return `${String(h).padStart(2, '0')}:00`;
});

const BLOCKED_INITIAL = [7, 8, 14, 15, 21, 22, 28, 29]; // weekends + feriados March

function buildMarchDays() {
  // March 1 = Sunday (0)
  return Array.from({ length: 31 }, (_, i) => i + 1);
}

export default function SettingsSection() {
  const [activeDays, setActiveDays]     = useState([0, 1, 2, 3, 4, 5]); // Mon–Sat
  const [startHour, setStartHour]       = useState('08:00');
  const [endHour, setEndHour]           = useState('18:00');
  const [interval, setInterval]         = useState(30);
  const [blockedDays, setBlockedDays]   = useState<number[]>(BLOCKED_INITIAL);
  const [saved, setSaved]               = useState(false);

  function toggleDay(i: number) {
    setActiveDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i].sort()
    );
  }

  function toggleBlock(day: number) {
    setBlockedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  const marchDays = buildMarchDays();

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Configurações</h2>
        <p className="admin-section-sub">Horários, dias de atendimento e datas bloqueadas</p>
      </div>

      <div className="admin-settings-grid">
        {/* Working days */}
        <div className="admin-settings-card">
          <h3 className="admin-settings-card-title">Dias de atendimento</h3>
          <p className="admin-settings-card-sub">Selecione os dias em que a clínica atende</p>
          <div className="admin-day-toggles">
            {DAYS_ABBR.map((d, i) => (
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

        {/* Working hours */}
        <div className="admin-settings-card">
          <h3 className="admin-settings-card-title">Horários de funcionamento</h3>
          <p className="admin-settings-card-sub">Defina o horário de início e encerramento</p>
          <div className="admin-hour-row">
            <div className="admin-hour-field">
              <label className="admin-hour-label">Início</label>
              <select
                className="admin-hour-select"
                value={startHour}
                onChange={e => setStartHour(e.target.value)}
              >
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <span className="admin-hour-sep">até</span>
            <div className="admin-hour-field">
              <label className="admin-hour-label">Encerramento</label>
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

        {/* Interval */}
        <div className="admin-settings-card">
          <h3 className="admin-settings-card-title">Intervalo entre horários</h3>
          <p className="admin-settings-card-sub">Tempo mínimo entre cada agendamento</p>
          <div className="admin-interval-group">
            {[15, 30, 45, 60].map(m => (
              <button
                key={m}
                className={`admin-interval-btn${interval === m ? ' active' : ''}`}
                onClick={() => setInterval(m)}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* Block dates */}
        <div className="admin-settings-card admin-settings-card-wide">
          <h3 className="admin-settings-card-title">Datas bloqueadas — Março 2026</h3>
          <p className="admin-settings-card-sub">Clique em um dia para bloquear ou desbloquear. Dias em vermelho estão indisponíveis.</p>
          <div className="admin-block-cal">
            {/* Weekday headers */}
            {['D','S','T','Q','Q','S','S'].map((h, i) => (
              <span key={i} className="admin-block-wday">{h}</span>
            ))}
            {marchDays.map(d => {
              const isBlocked = blockedDays.includes(d);
              const dateStr = `2026-03-${String(d).padStart(2,'0')}`;
              const isToday = dateStr === '2026-03-04';
              return (
                <button
                  key={d}
                  className={[
                    'admin-block-day',
                    isBlocked ? 'blocked' : '',
                    isToday ? 'today' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => toggleBlock(d)}
                  title={isBlocked ? `Desbloquear dia ${d}` : `Bloquear dia ${d}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="admin-settings-save-row">
        <button className={`admin-settings-save${saved ? ' saved' : ''}`} onClick={handleSave}>
          {saved ? (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Salvo com sucesso
            </>
          ) : 'Salvar configurações'}
        </button>
      </div>
    </div>
  );
}
