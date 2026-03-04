'use client';

import { useState } from 'react';
import { ADMIN_APPOINTMENTS, getTotalRevenue, getTicketMedio } from '@/lib/admin-data';

type Period = 'semana' | 'mes' | 'trimestre';

const PROCEDURE_LABELS: Record<string, string> = {
  'Toxina Botulínica':   'Toxina Botulínica',
  'Preenchimento Labial':'Preenchimento Labial',
  'Laser Corporal':      'Laser Corporal',
  'Limpeza de Pele':     'Limpeza de Pele',
  'Drenagem Linfática':  'Drenagem Linfática',
  'Massagem Relaxante':  'Massagem Relaxante',
};

function fmtCurrency(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR');
}

function getRevenueByPeriod(period: Period): number {
  const confirmed = ADMIN_APPOINTMENTS.filter(a => a.status === 'confirmado');
  if (period === 'semana') {
    // Current week: Mar 2–8
    return confirmed.filter(a => a.date >= '2026-03-02' && a.date <= '2026-03-08')
      .reduce((s, a) => s + a.priceNum, 0);
  }
  if (period === 'mes') return getTotalRevenue();
  // trimestre: multiply by 3 approximate
  return Math.round(getTotalRevenue() * 2.7);
}

function getMostBooked(): { name: string; count: number } {
  const counts: Record<string, number> = {};
  for (const a of ADMIN_APPOINTMENTS) {
    if (a.status !== 'cancelado') counts[a.procedure] = (counts[a.procedure] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : { name: '—', count: 0 };
}

function getConfirmationRate(): number {
  const total = ADMIN_APPOINTMENTS.length;
  const confirmed = ADMIN_APPOINTMENTS.filter(a => a.status === 'confirmado').length;
  return Math.round((confirmed / total) * 100);
}

function getProcedureBreakdown(): { name: string; revenue: number; count: number }[] {
  const map: Record<string, { revenue: number; count: number }> = {};
  for (const a of ADMIN_APPOINTMENTS) {
    if (a.status === 'confirmado') {
      if (!map[a.procedure]) map[a.procedure] = { revenue: 0, count: 0 };
      map[a.procedure].revenue += a.priceNum;
      map[a.procedure].count++;
    }
  }
  return Object.entries(map)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
}

export default function RevenueSection() {
  const [period, setPeriod] = useState<Period>('mes');

  const periodRevenue = getRevenueByPeriod(period);
  const ticket        = getTicketMedio();
  const mostBooked    = getMostBooked();
  const confRate      = getConfirmationRate();
  const breakdown     = getProcedureBreakdown();
  const totalRev      = getTotalRevenue();

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Receita</h2>
        <p className="admin-section-sub">Análise financeira dos agendamentos</p>
      </div>

      {/* Period selector */}
      <div className="admin-period-tabs">
        {(['semana', 'mes', 'trimestre'] as Period[]).map(p => (
          <button
            key={p}
            className={`admin-period-tab${period === p ? ' active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p === 'semana' ? 'Esta semana' : p === 'mes' ? 'Este mês' : 'Trimestre'}
          </button>
        ))}
      </div>

      {/* Hero revenue card */}
      <div className="admin-revenue-hero">
        <p className="admin-revenue-hero-label">Receita {period === 'semana' ? 'da semana' : period === 'mes' ? 'do mês' : 'do trimestre'}</p>
        <p className="admin-revenue-hero-value">{fmtCurrency(periodRevenue)}</p>
        <p className="admin-revenue-hero-sub">somente agendamentos confirmados</p>
      </div>

      {/* Secondary cards */}
      <div className="admin-revenue-cards">
        <div className="admin-revenue-card">
          <p className="admin-revenue-card-label">Ticket médio</p>
          <p className="admin-revenue-card-value">{fmtCurrency(ticket)}</p>
          <p className="admin-revenue-card-sub">por agendamento</p>
        </div>
        <div className="admin-revenue-card">
          <p className="admin-revenue-card-label">Procedimento líder</p>
          <p className="admin-revenue-card-value-sm">{mostBooked.name}</p>
          <p className="admin-revenue-card-sub">{mostBooked.count} agendamentos</p>
        </div>
        <div className="admin-revenue-card">
          <p className="admin-revenue-card-label">Taxa de confirmação</p>
          <p className="admin-revenue-card-value">{confRate}%</p>
          <p className="admin-revenue-card-sub">do total de agendamentos</p>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="admin-breakdown-wrap">
        <h3 className="admin-breakdown-title">Receita por procedimento</h3>
        <div className="admin-breakdown-list">
          {breakdown.map(b => {
            const pct = Math.round((b.revenue / totalRev) * 100);
            return (
              <div key={b.name} className="admin-breakdown-row">
                <div className="admin-breakdown-info">
                  <p className="admin-breakdown-name">{b.name}</p>
                  <p className="admin-breakdown-count">{b.count} confirmados</p>
                </div>
                <div className="admin-breakdown-bar-wrap">
                  <div className="admin-breakdown-bar" style={{ width: `${pct}%` }} />
                </div>
                <p className="admin-breakdown-rev">{fmtCurrency(b.revenue)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
