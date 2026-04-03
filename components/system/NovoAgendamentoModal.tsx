'use client';

import { useState, useEffect, useMemo } from 'react';
import { PROCEDURE_CATALOG } from '@/lib/constants';
import { addAppointment } from '@/lib/admin-data';
import { createStaffClient } from '@/lib/supabase/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
  onSaved?: () => void;
}

const PAGAMENTOS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Outro'];

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAYS    = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];

function formatDateDisplay(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(`${dateStr}T12:00:00`).getDay();
  return `${WEEKDAYS[dow]}, ${d} de ${MONTH_NAMES[m - 1]} de ${y}`;
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

const EMPTY = { name: '', phone: '', procedure: 0, payment: 'Pix', value: '', obs: '' };

export default function NovoAgendamentoModal({ isOpen, onClose, defaultDate, defaultTime, onSaved }: Props) {
  const [form, setForm]     = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const staffClient = useMemo(() => createStaffClient(), []);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, procedure: 0, value: PROCEDURE_CATALOG[0].price });
      setErrors({});
    }
  }, [isOpen]);

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

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim())              errs.name  = 'Informe o nome do cliente.';
    else if (form.name.trim().length < 3) errs.name = 'Nome muito curto.';

    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length < 10) errs.phone = 'Telefone incompleto.';
    }

    if (!defaultDate) errs._date = 'Nenhuma data selecionada.';
    if (!defaultTime) errs._time = 'Clique em um horário disponível na agenda para abrir este formulário.';

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
      date:      defaultDate!,
      time:      defaultTime!,
      status:    'confirmado',
    }, undefined, staffClient);

    setSaving(false);

    if (!result) { setErrors({ _save: 'Erro ao salvar agendamento. Tente novamente.' }); return; }

    onSaved?.();
    onClose();
  }

  if (!isOpen) return null;

  const hasDatetime = defaultDate && defaultTime;

  return (
    <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-modal">
        <div className="na-modal-header">
          <div>
            <h2 className="na-modal-title">Novo Agendamento</h2>
            <p className="na-modal-sub">
              {hasDatetime
                ? `${formatDateDisplay(defaultDate!)} · ${defaultTime}`
                : 'Preencha os dados do agendamento'}
            </p>
          </div>
          <button className="na-close" onClick={onClose} aria-label="Fechar">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Date/time badge */}
        {hasDatetime && (
          <div className="na-datetime-row">
            <span className="na-datetime-chip">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {defaultDate}
            </span>
            <span className="na-datetime-chip">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {defaultTime}
            </span>
          </div>
        )}

        {(errors._date || errors._time) && (
          <div className="na-modal-body" style={{ paddingBottom: 0 }}>
            <p className="na-error">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors._date || errors._time}
            </p>
          </div>
        )}

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

            {/* Forma de pagamento */}
            <div className="na-field">
              <label className="na-label">Forma de pagamento</label>
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
          <button className="na-save" onClick={handleSave} disabled={saving || !hasDatetime}>
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
