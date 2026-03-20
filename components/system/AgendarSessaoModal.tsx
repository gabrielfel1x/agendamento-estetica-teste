'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { PROCEDURE_CATALOG, ALL_TIMES } from '@/lib/constants';
import { getAppointmentsByDay, addAppointment } from '@/lib/admin-data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const TODAY_STR = '2026-03-20';
const WEEKDAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

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

  const [step,         setStep]         = useState<'procedure' | 'datetime'>('procedure');
  const [procIdx,      setProcIdx]      = useState(0);
  const [calYear,      setCalYear]      = useState(2026);
  const [calMonth,     setCalMonth]     = useState(2); // março
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('procedure');
      setProcIdx(0);
      setCalYear(2026);
      setCalMonth(2);
      setSelectedDate('');
      setSelectedTime('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const procedure = PROCEDURE_CATALOG[procIdx];
  const calDays   = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth]);

  // Horários já reservados para a data selecionada
  const bookedTimes = useMemo<Set<string>>(() => {
    if (!selectedDate) return new Set();
    return new Set(
      getAppointmentsByDay(selectedDate)
        .filter(a => a.status !== 'cancelado')
        .map(a => a.time)
    );
  }, [selectedDate]);

  function toDateStr(d: number) {
    return `${calYear}-${pad(calMonth + 1)}-${pad(d)}`;
  }

  function isDisabled(d: number) {
    const ds  = toDateStr(d);
    const dow = new Date(`${ds}T12:00:00`).getDay();
    return ds < TODAY_STR || dow === 0; // passado ou domingo
  }

  const canGoPrev = calYear > 2026 || calMonth > 2; // não navegar antes de março 2026

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

  function handleConfirm() {
    if (!selectedDate) { setError('Selecione uma data.'); return; }
    if (!selectedTime) { setError('Selecione um horário disponível.'); return; }

    addAppointment({
      patient:   user!.name,
      phone:     '',
      procedure: procedure.name,
      priceNum:  procedure.priceNum,
      price:     procedure.price,
      date:      selectedDate,
      time:      selectedTime,
      status:    'confirmado',
    });

    onSaved?.();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-modal clt-modal">

        {/* ── Header ── */}
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

        {/* ── Progress ── */}
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

          {/* ══ STEP 1 — Procedimentos ══ */}
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

          {/* ══ STEP 2 — Data + Horário ══ */}
          {step === 'datetime' && (
            <div className="clt-datetime">

              {/* Calendário */}
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
                    const isToday  = toDateStr(d) === TODAY_STR;
                    return (
                      <button
                        key={d}
                        disabled={disabled}
                        onClick={() => selectDay(d)}
                        className={[
                          'clt-cal-day',
                          disabled ? 'disabled' : '',
                          selected  ? 'selected'  : '',
                          isToday   ? 'today'     : '',
                        ].filter(Boolean).join(' ')}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horários */}
              <div className="clt-times">
                <p className="clt-times-title">
                  {selectedDate ? 'Horários disponíveis' : 'Selecione uma data'}
                </p>
                {selectedDate ? (
                  <>
                    <div className="clt-times-grid">
                      {ALL_TIMES.map(t => {
                        const busy = bookedTimes.has(t);
                        const sel  = t === selectedTime;
                        return (
                          <button
                            key={t}
                            disabled={busy}
                            onClick={() => { setSelectedTime(t); setError(''); }}
                            className={['clt-time', busy ? 'busy' : 'avail', sel ? 'selected' : ''].filter(Boolean).join(' ')}
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

        {/* ── Footer ── */}
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
              <button className="na-cancel" onClick={() => { setStep('procedure'); setError(''); }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar
              </button>
              <button
                className="na-save"
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirmar agendamento
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
