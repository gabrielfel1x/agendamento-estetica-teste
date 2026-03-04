'use client';

import { useState } from 'react';
import { CLIENTES, getClienteHistory, getClienteTotalAppointments, getClienteLastProcedure, Cliente } from '@/lib/clientes-data';

function waLink(phone: string, name: string) {
  const msg = encodeURIComponent(`Olá ${name}! Entrando em contato da Clínica Lumière.`);
  return `https://wa.me/55${phone.replace(/\D/g, '')}?text=${msg}`;
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '');
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${parseInt(d)} ${months[parseInt(m)-1]}. ${y}`;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

const AVATAR_COLORS = [
  '#0a0a0a','#c9a84c','#333','#b89840','#8a7430',
  '#0a0a0a','#c9a84c','#333','#b89840','#8a7430','#0a0a0a','#c9a84c',
];

export default function ClientesPage() {
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState<Cliente | null>(null);

  const filtered = CLIENTES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const history = selected ? getClienteHistory(selected.phone) : [];

  return (
    <div className="admin-section clientes-page">
      <div className="clientes-header">
        <div>
          <h2 className="admin-section-title">Clientes</h2>
          <p className="admin-section-sub">{CLIENTES.length} clientes cadastrados</p>
        </div>
        <div className="clientes-search-wrap">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="clientes-search-icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="clientes-search"
            placeholder="Buscar por nome ou telefone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={`clientes-layout${selected ? ' has-panel' : ''}`}>
        {/* Cards grid */}
        <div className="clientes-grid">
          {filtered.map((c, i) => {
            const total = getClienteTotalAppointments(c.phone);
            const last  = getClienteLastProcedure(c.phone);
            const isSelected = selected?.id === c.id;
            return (
              <button
                key={c.id}
                className={`cliente-card${isSelected ? ' selected' : ''}`}
                onClick={() => setSelected(prev => prev?.id === c.id ? null : c)}
              >
                <div className="cliente-avatar" style={{ background: AVATAR_COLORS[i] }}>
                  {getInitials(c.name)}
                </div>
                <div className="cliente-card-info">
                  <p className="cliente-name">{c.name}</p>
                  <p className="cliente-phone">{formatPhone(c.phone)}</p>
                  {last && <p className="cliente-last">{last}</p>}
                </div>
                <div className="cliente-card-stats">
                  <span className="cliente-stat-n">{total}</span>
                  <span className="cliente-stat-l">visitas</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="clientes-empty">
              <p>Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="cliente-panel">
            <div className="cliente-panel-header">
              <div className="cliente-panel-avatar" style={{ background: AVATAR_COLORS[CLIENTES.indexOf(selected)] }}>
                {getInitials(selected.name)}
              </div>
              <div>
                <h3 className="cliente-panel-name">{selected.name}</h3>
                <p className="cliente-panel-since">cliente desde {formatDate(selected.since)}</p>
              </div>
              <button className="cliente-panel-close" onClick={() => setSelected(null)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="cliente-panel-contact">
              <a href={`tel:+55${selected.phone}`} className="cliente-contact-item">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {formatPhone(selected.phone)}
              </a>
              <a href={`mailto:${selected.email}`} className="cliente-contact-item">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {selected.email}
              </a>
              <a
                href={waLink(selected.phone, selected.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="cliente-wa-btn"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar no WhatsApp
              </a>
            </div>

            <div className="cliente-panel-history">
              <h4 className="cliente-panel-history-title">Histórico de agendamentos</h4>
              {history.length === 0 ? (
                <p className="cliente-history-empty">Nenhum agendamento encontrado.</p>
              ) : (
                <div className="cliente-history-list">
                  {history.map(a => (
                    <div key={a.id} className="cliente-history-row">
                      <div className="cliente-history-date">{formatDate(a.date)}</div>
                      <div className="cliente-history-info">
                        <p className="cliente-history-proc">{a.procedure}</p>
                        <p className="cliente-history-time">{a.time}</p>
                      </div>
                      <div className="cliente-history-right">
                        <span className="cliente-history-price">{a.price}</span>
                        <span className={`admin-day-badge ${a.status}`}>{a.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
