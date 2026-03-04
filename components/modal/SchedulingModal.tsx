'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PROCEDURES, MONTHS_PT, DAYS_PT, TODAY, DISABLED_DAYS_MARCH, ALL_TIMES, UNAVAIL_TIMES, LAST_TIMES } from '@/lib/constants';
import type { ModalState } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialProc?: number;
}

const INITIAL_STATE: ModalState = {
  step: 1,
  procIdx: -1,
  selDate: null,
  selTime: null,
  formData: { name: '', phone: '', email: '', obs: '' },
  payMethod: 'card',
};

export default function SchedulingModal({ isOpen, onClose, initialProc }: Props) {
  const [state, setState] = useState<ModalState>(INITIAL_STATE);
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(2); // March 0-indexed
  const [pixSec, setPixSec] = useState(899);

  // Pre-select procedure if provided
  useEffect(() => {
    if (isOpen && initialProc !== undefined && initialProc >= 0) {
      setState(s => ({ ...s, procIdx: initialProc }));
    }
    if (!isOpen) {
      // Reset on close
      setTimeout(() => {
        setState(INITIAL_STATE);
        setCalYear(2026);
        setCalMonth(2);
        setPixSec(899);
      }, 500);
    }
  }, [isOpen, initialProc]);

  // Pix timer
  useEffect(() => {
    if (!isOpen || state.step !== 5 || state.payMethod !== 'pix') return;
    const id = setInterval(() => setPixSec(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [isOpen, state.step, state.payMethod]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const goToStep = useCallback((n: number) => {
    setState(s => ({ ...s, step: n }));
  }, []);

  const nextStep = () => {
    if (state.step < 6) goToStep(state.step + 1);
  };
  const prevStep = () => {
    if (state.step > 1) goToStep(state.step - 1);
  };

  const isNextEnabled = () => {
    if (state.step === 1) return state.procIdx >= 0;
    if (state.step === 2) return state.selDate !== null;
    if (state.step === 3) return state.selTime !== null;
    if (state.step === 4) return state.formData.name.length > 2 && state.formData.email.includes('@');
    if (state.step === 5) return true;
    return false;
  };

  // Calendar helpers
  const renderCalDays = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e${i}`} className="cal-day empty" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(calYear, calMonth, d);
      const isPast     = thisDate < TODAY && thisDate.toDateString() !== TODAY.toDateString();
      const isToday    = thisDate.toDateString() === TODAY.toDateString();
      const isWeekend  = thisDate.getDay() === 0 || thisDate.getDay() === 6;
      const isDisabled = calMonth === 2 && DISABLED_DAYS_MARCH.includes(d);
      const isSel      = state.selDate?.getDate() === d && state.selDate?.getMonth() === calMonth;

      let cls = 'cal-day';
      if (isSel) cls += ' sel';
      else if (isToday) cls += ' today';
      if (isPast || isWeekend || isDisabled) cls += ' disabled';

      const canClick = !isPast && !isWeekend && !isDisabled;

      cells.push(
        <div
          key={d}
          className={cls}
          onClick={canClick ? () => setState(s => ({ ...s, selDate: new Date(calYear, calMonth, d) })) : undefined}
        >
          {d}
        </div>
      );
    }
    return cells;
  };

  const formatSelDate = () => {
    if (!state.selDate) return '';
    const d = state.selDate;
    const day = DAYS_PT[d.getDay()];
    return `${day.charAt(0).toUpperCase()}${day.slice(1)}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`;
  };

  const pixTime = `${Math.floor(pixSec / 60)}:${(pixSec % 60).toString().padStart(2, '0')}`;

  const proc = state.procIdx >= 0 ? PROCEDURES[state.procIdx] : null;

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} id="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-sheet">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-prog">
            {[1,2,3,4,5,6].map(n => (
              <div
                key={n}
                className={`prog-step${state.step === n ? ' active' : ''}${state.step > n ? ' done' : ''}`}
              >
                <div className="prog-dot">
                  {state.step > n ? (
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : n}
                </div>
                {n < 6 && <div className="prog-line" />}
              </div>
            ))}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* ── Step 1: Procedure ─────────────────────── */}
          {state.step === 1 && (
            <div className="modal-step active">
              <h2 className="step-h">Qual procedimento?</h2>
              <p className="step-s">Escolha o tratamento que deseja realizar.</p>
              <div className="m-procs-grid">
                {PROCEDURES.map((p, i) => (
                  <div
                    key={p.name}
                    className={`m-proc-card${state.procIdx === i ? ' sel' : ''}`}
                    onClick={() => setState(s => ({ ...s, procIdx: i }))}
                  >
                    <div className="m-proc-img">
                      <img src={p.image.replace('w=800', 'w=600')} alt={p.name} />
                    </div>
                    <div className="m-sel-check">✓</div>
                    <div className="m-proc-body">
                      <p className="m-proc-name">{p.name}</p>
                      <div className="m-proc-meta">
                        <span>{p.dur}</span>
                        <span className="m-proc-price">{p.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Calendar ──────────────────────── */}
          {state.step === 2 && (
            <div className="modal-step active">
              <h2 className="step-h">Escolha uma data</h2>
              <p className="step-s">Selecione o dia disponível que preferir.</p>
              <div className="cal-wrap">
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={() => {
                    let m = calMonth - 1, y = calYear;
                    if (m < 0) { m = 11; y--; }
                    setCalMonth(m); setCalYear(y);
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <span className="cal-month">{MONTHS_PT[calMonth]} {calYear}</span>
                  <button className="cal-nav-btn" onClick={() => {
                    let m = calMonth + 1, y = calYear;
                    if (m > 11) { m = 0; y++; }
                    setCalMonth(m); setCalYear(y);
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
                <div className="cal-days-h">
                  {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
                    <div key={d} className="cal-day-name">{d}</div>
                  ))}
                </div>
                <div className="cal-grid">{renderCalDays()}</div>
              </div>
            </div>
          )}

          {/* ── Step 3: Time ──────────────────────────── */}
          {state.step === 3 && (
            <div className="modal-step active">
              <h2 className="step-h">Selecione o horário</h2>
              <p className="sel-date-display">{formatSelDate()}</p>
              <div className="time-grid">
                {ALL_TIMES.map(t => {
                  const unavail = UNAVAIL_TIMES.includes(t);
                  const last    = LAST_TIMES.includes(t);
                  const sel     = state.selTime === t;
                  let cls = 't-slot';
                  if (sel)     cls += ' sel';
                  if (unavail) cls += ' unavail';
                  if (last)    cls += ' last';
                  return (
                    <button
                      key={t}
                      className={cls}
                      disabled={unavail}
                      onClick={() => !unavail && setState(s => ({ ...s, selTime: t }))}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 4: Form ──────────────────────────── */}
          {state.step === 4 && (
            <div className="modal-step active">
              <h2 className="step-h">Seus dados</h2>
              <p className="step-s">Precisamos de algumas informações para confirmar seu agendamento.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="f-label">Nome completo</label>
                  <input
                    type="text" className="f-input"
                    placeholder="Seu nome completo"
                    value={state.formData.name}
                    onChange={e => setState(s => ({ ...s, formData: { ...s.formData, name: e.target.value } }))}
                  />
                  <span className="f-underline" />
                </div>
                <div className="form-group">
                  <label className="f-label">Telefone / WhatsApp</label>
                  <input
                    type="tel" className="f-input"
                    placeholder="(11) 99999-9999"
                    value={state.formData.phone}
                    onChange={e => setState(s => ({ ...s, formData: { ...s.formData, phone: e.target.value } }))}
                  />
                  <span className="f-underline" />
                </div>
                <div className="form-group full">
                  <label className="f-label">E-mail</label>
                  <input
                    type="email" className="f-input"
                    placeholder="seu@email.com.br"
                    value={state.formData.email}
                    onChange={e => setState(s => ({ ...s, formData: { ...s.formData, email: e.target.value } }))}
                  />
                  <span className="f-underline" />
                </div>
                <div className="form-group full">
                  <label className="f-label">Observações (opcional)</label>
                  <textarea
                    className="f-textarea"
                    placeholder="Alergias, informações importantes..."
                    value={state.formData.obs}
                    onChange={e => setState(s => ({ ...s, formData: { ...s.formData, obs: e.target.value } }))}
                  />
                  <span className="f-underline" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Payment ───────────────────────── */}
          {state.step === 5 && (
            <div className="modal-step active">
              <h2 className="step-h">Forma de pagamento</h2>
              <p className="step-s">Escolha como prefere realizar o pagamento.</p>
              <div className="pay-summary">
                <div>
                  <p className="pay-proc">{proc?.name}</p>
                  {state.selDate && (
                    <p style={{ fontSize: '.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {state.selDate.getDate()} de {MONTHS_PT[state.selDate.getMonth()].toLowerCase()} &middot; {state.selTime}
                    </p>
                  )}
                </div>
                <span className="pay-total">{proc?.price}</span>
              </div>

              <div className="pay-tabs">
                <button
                  className={`pay-tab${state.payMethod === 'card' ? ' active' : ''}`}
                  onClick={() => setState(s => ({ ...s, payMethod: 'card' }))}
                >
                  Cartão de Crédito
                </button>
                <button
                  className={`pay-tab${state.payMethod === 'pix' ? ' active' : ''}`}
                  onClick={() => setState(s => ({ ...s, payMethod: 'pix' }))}
                >
                  PIX
                </button>
              </div>

              {state.payMethod === 'card' && (
                <div className="pay-panel active">
                  <div className="card-fields">
                    <div className="form-group full">
                      <label className="f-label">Número do cartão</label>
                      <input type="text" className="f-input" placeholder="0000 0000 0000 0000" maxLength={19} />
                      <span className="f-underline" />
                    </div>
                    <div className="form-group full">
                      <label className="f-label">Nome no cartão</label>
                      <input type="text" className="f-input" placeholder="NOME SOBRENOME" style={{ textTransform: 'uppercase' }} />
                      <span className="f-underline" />
                    </div>
                    <div className="card-row">
                      <div className="form-group">
                        <label className="f-label">Validade</label>
                        <input type="text" className="f-input" placeholder="MM/AA" maxLength={5} />
                        <span className="f-underline" />
                      </div>
                      <div className="form-group">
                        <label className="f-label">CVV</label>
                        <input type="text" className="f-input" placeholder="000" maxLength={4} />
                        <span className="f-underline" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state.payMethod === 'pix' && (
                <div className="pay-panel active">
                  <div className="pix-wrap">
                    <div className="pix-qr"><div className="pix-qr-grid" /></div>
                    <p className="pix-key">
                      Chave Pix: <strong>contato@lumiere.com.br</strong>
                      <br />ou escaneie o QR Code acima.
                    </p>
                    <button className="pix-copy" onClick={(e) => {
                      navigator.clipboard.writeText('contato@lumiere.com.br').catch(() => {});
                      const btn = e.currentTarget;
                      btn.textContent = 'Chave copiada!';
                      setTimeout(() => { btn.textContent = 'Copiar chave Pix'; }, 2000);
                    }}>
                      Copiar chave Pix
                    </button>
                    <p className="pix-timer">QR Code válido por <strong>{pixTime}</strong></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 6: Confirmation ──────────────────── */}
          {state.step === 6 && (
            <div className="modal-step active">
              <div className="confirm-wrap">
                <div className="check-circle">
                  <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="confirm-h">Agendamento confirmado!</h2>
                <p className="confirm-sub">
                  Você receberá a confirmação por e-mail e WhatsApp em instantes.
                  Estamos te esperando!
                </p>

                <div className="confirm-card">
                  <div className="confirm-row">
                    <span className="ck">Procedimento</span>
                    <span className="cv">{proc?.name}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="ck">Data</span>
                    <span className="cv">
                      {state.selDate
                        ? `${state.selDate.getDate()} de ${MONTHS_PT[state.selDate.getMonth()].toLowerCase()} de ${state.selDate.getFullYear()}`
                        : '—'}
                    </span>
                  </div>
                  <div className="confirm-row">
                    <span className="ck">Horário</span>
                    <span className="cv">{state.selTime}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="ck">Paciente</span>
                    <span className="cv">{state.formData.name}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="ck">Valor</span>
                    <span className="cv">{proc?.price}</span>
                  </div>
                </div>

                <div className="confirm-btns">
                  <button className="btn-conf-p">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Adicionar ao calendário
                  </button>

                  {/* ← NEW: View appointments */}
                  <Link href="/agendamentos" className="btn-view-apts" onClick={onClose}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
                    </svg>
                    Visualizar meus agendamentos
                  </Link>

                  <button className="btn-conf-s" onClick={() => { onClose(); }}>
                    Voltar ao início
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>{/* /modal-body */}

        {/* Footer */}
        {state.step < 6 && (
          <div className="modal-footer">
            <button
              className="btn-back"
              onClick={prevStep}
              style={{ visibility: state.step > 1 ? 'visible' : 'hidden' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <button className="btn-next" onClick={nextStep} disabled={!isNextEnabled()}>
              {state.step === 5 ? 'Confirmar Agendamento' : 'Continuar'}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

      </div>{/* /modal-sheet */}
    </div>
  );
}
