'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_APPOINTMENTS } from '@/lib/constants';
import type { Appointment } from '@/lib/types';

type Filter = 'todos' | 'confirmado' | 'pendente' | 'cancelado';

export default function AgendamentosPage() {
  const [filter, setFilter] = useState<Filter>('todos');

  const filtered = filter === 'todos'
    ? MOCK_APPOINTMENTS
    : MOCK_APPOINTMENTS.filter(a => a.status === filter);

  const count = (s: Appointment['status']) => MOCK_APPOINTMENTS.filter(a => a.status === s).length;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${d} de ${months[m - 1]}. de ${y}`;
  };

  return (
    <div className="apts-page">
      {/* Header */}
      <header className="apts-header">
        <div className="container">
          <div className="apts-header-inner">
            <Link href="/" className="apts-header-logo">
              <span>Lumière</span>
              <span className="logo-dot" />
            </Link>
            <Link href="/" className="apts-back-link">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar ao site
            </Link>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Hero */}
        <div className="apts-hero">
          <p className="apts-hero-label">Área da cliente</p>
          <h1 className="apts-hero-title">
            Meus <em>agendamentos</em>
          </h1>
          <p className="apts-hero-sub">Gerencie e visualize todos os seus agendamentos na Lumière.</p>
        </div>

        {/* Stats */}
        <div className="apts-stats">
          <div className="apts-stat-card">
            <p className={`apts-stat-n stat-total`}>{MOCK_APPOINTMENTS.length}</p>
            <p className="apts-stat-l">Agendamentos</p>
          </div>
          {/* <div className="apts-stat-card">
            <p className="apts-stat-n stat-confirmado">{count('confirmado')}</p>
            <p className="apts-stat-l">Confirmados</p>
          </div>
          <div className="apts-stat-card">
            <p className="apts-stat-n stat-pendente">{count('pendente')}</p>
            <p className="apts-stat-l">Pendentes</p>
          </div>
          <div className="apts-stat-card">
            <p className="apts-stat-n stat-cancelado">{count('cancelado')}</p>
            <p className="apts-stat-l">Cancelados</p>
          </div> */}
        </div> 

        {/* Filters */}
        {/* <div className="apts-filters">
          {(['todos','confirmado','pendente','cancelado'] as Filter[]).map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div> */}

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="apts-empty">
            <svg className="apts-empty-icon" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="apts-empty-title">Nenhum agendamento encontrado</h3>
            <p className="apts-empty-sub">Não há agendamentos com o filtro selecionado.</p>
            <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'8px' }} className="btn-view-apts">
              Fazer um agendamento
            </Link>
          </div>
        ) : (
          <div className="apts-grid">
            {filtered.map(apt => (
              <div key={apt.id} className="apt-card">
                <div className={`apt-card-status-bar ${apt.status}`} />
                <div className="apt-card-body">
                  <div className="apt-thumb">
                    <img src={apt.image} alt={apt.procedure} />
                  </div>
                  <div className="apt-info">
                    <p className="apt-proc-name">{apt.procedure}</p>
                    <p className="apt-datetime">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(apt.date)}
                      &nbsp;&middot;&nbsp;
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                      {apt.time}
                    </p>
                    <p className="apt-patient">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{display:'inline', marginRight:'4px', verticalAlign:'middle'}}>
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      {apt.patient}
                    </p>
                  </div>
                </div>
                <div className="apt-footer">
                  <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                    {/* <span className={`apt-status-badge ${apt.status}`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span> */}
                    <span className="apt-price">{apt.price}</span>
                  </div>
                  <div className="apt-actions">
                    <button className="apt-action-btn apt-action-detail">
                      Ver detalhes
                    </button>
                    {/* {apt.status !== 'cancelado' && (
                      <button className="apt-action-btn apt-action-cancel">
                        Cancelar
                      </button>
                    )} */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
