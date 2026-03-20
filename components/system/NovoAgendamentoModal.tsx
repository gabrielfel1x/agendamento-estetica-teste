'use client';

import { useState, useEffect } from 'react';
import { PROCEDURE_CATALOG, ALL_TIMES } from '@/lib/constants';
import { addAppointment } from '@/lib/admin-data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onSaved?: () => void;
}

const PAGAMENTOS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Outro'];

const EMPTY = {
  name: '', phone: '', procedure: 0, date: '', time: '', payment: 'Pix', value: '', obs: '',
};

export default function NovoAgendamentoModal({ isOpen, onClose, defaultDate, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, date: defaultDate || '' });
      setError('');
    }
  }, [isOpen, defaultDate]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Auto-fill value from procedure
  useEffect(() => {
    const proc = PROCEDURE_CATALOG[form.procedure];
    if (proc) setForm(f => ({ ...f, value: proc.price }));
  }, [form.procedure]);

  function set(key: string, val: string | number) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    if (!form.name.trim()) { setError('Informe o nome do cliente.'); return; }
    if (!form.date)         { setError('Selecione uma data.'); return; }
    if (!form.time)         { setError('Selecione um horário.'); return; }
    addAppointment({
      patient:   form.name.trim(),
      phone:     form.phone.replace(/\D/g, ''),
      procedure: PROCEDURE_CATALOG[form.procedure].name,
      priceNum:  parseInt(form.value.replace(/\D/g, '')) || 0,
      price:     form.value,
      date:      form.date,
      time:      form.time,
      status:    'confirmado',
    });
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
            <p className="na-modal-sub">Preencha os dados para criar um agendamento</p>
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
                className="na-input"
                placeholder="Ex: Maria Silva"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            {/* Telefone */}
            <div className="na-field">
              <label className="na-label">Telefone</label>
              <input
                className="na-input"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
              />
            </div>

            {/* Procedimento */}
            <div className="na-field">
              <label className="na-label">Procedimento *</label>
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

            {/* Data */}
            <div className="na-field">
              <label className="na-label">Data *</label>
              <input
                className="na-input"
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>

            {/* Horário */}
            <div className="na-field">
              <label className="na-label">Horário *</label>
              <select
                className="na-select"
                value={form.time}
                onChange={e => set('time', e.target.value)}
              >
                <option value="">Selecione</option>
                {ALL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Pagamento */}
            <div className="na-field">
              <label className="na-label">Forma de pagamento</label>
              <select
                className="na-select"
                value={form.payment}
                onChange={e => set('payment', e.target.value)}
              >
                {PAGAMENTOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Valor */}
            <div className="na-field">
              <label className="na-label">Valor</label>
              <input
                className="na-input"
                placeholder="R$ 0,00"
                value={form.value}
                onChange={e => set('value', e.target.value)}
              />
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

          {error && (
            <p className="na-error">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}
        </div>

        <div className="na-modal-footer">
          <button className="na-cancel" onClick={onClose}>Cancelar</button>
          <button className="na-save" onClick={handleSave}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Salvar agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
