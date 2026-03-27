'use client';

import { useState, useEffect } from 'react';
import { getAllAppointments, AdminAppointment } from '@/lib/admin-data';

type Period = 'semana' | 'mes' | 'trimestre';

function fmtCurrency(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR');
}

function getWeekRange(): { from: string; to: string } {
  const now   = new Date();
  const day   = now.getDay(); // 0=Dom
  const mon   = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    from: mon.toISOString().slice(0, 10),
    to:   sun.toISOString().slice(0, 10),
  };
}

function getMonthRange(): { from: string; to: string } {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  return {
    from: `${year}-${String(month).padStart(2,'0')}-01`,
    to:   `${year}-${String(month).padStart(2,'0')}-31`,
  };
}

function computeRevenue(apts: AdminAppointment[], period: Period): number {
  const confirmed = apts.filter(a => a.status === 'confirmado');
  if (period === 'semana') {
    const { from, to } = getWeekRange();
    return confirmed.filter(a => a.date >= from && a.date <= to).reduce((s, a) => s + a.priceNum, 0);
  }
  if (period === 'mes') {
    const { from, to } = getMonthRange();
    return confirmed.filter(a => a.date >= from && a.date <= to).reduce((s, a) => s + a.priceNum, 0);
  }
  // trimestre: soma os últimos ~90 dias
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const from = cutoff.toISOString().slice(0, 10);
  return confirmed.filter(a => a.date >= from).reduce((s, a) => s + a.priceNum, 0);
}

function computeStats(apts: AdminAppointment[]) {
  const confirmed = apts.filter(a => a.status === 'confirmado');
  const totalRev  = confirmed.reduce((s, a) => s + a.priceNum, 0);
  const ticket    = confirmed.length ? Math.round(totalRev / confirmed.length) : 0;
  const confRate  = apts.length ? Math.round((confirmed.length / apts.length) * 100) : 0;

  const procMap: Record<string, { revenue: number; count: number }> = {};
  for (const a of confirmed) {
    if (!procMap[a.procedure]) procMap[a.procedure] = { revenue: 0, count: 0 };
    procMap[a.procedure].revenue += a.priceNum;
    procMap[a.procedure].count++;
  }
  const breakdown = Object.entries(procMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  const mostBooked = breakdown[0] ?? { name: '—', count: 0 };

  return { totalRev, ticket, confRate, breakdown, mostBooked };
}

export default function RevenueSection() {
  const [period, setPeriod]   = useState<Period>('mes');
  const [apts, setApts]       = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAppointments().then(data => {
      setApts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Receita</h2>
        </div>
        <div className="admin-loading">Carregando dados...</div>
      </div>
    );
  }

  const periodRevenue = computeRevenue(apts, period);
  const { totalRev, ticket, confRate, breakdown, mostBooked } = computeStats(apts);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Receita</h2>
        <p className="admin-section-sub">Análise financeira dos agendamentos</p>
      </div>

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

      <div className="admin-revenue-hero">
        <p className="admin-revenue-hero-label">
          Receita {period === 'semana' ? 'da semana' : period === 'mes' ? 'do mês' : 'do trimestre'}
        </p>
        <p className="admin-revenue-hero-value">{fmtCurrency(periodRevenue)}</p>
        <p className="admin-revenue-hero-sub">somente agendamentos confirmados</p>
      </div>

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

      <div className="admin-breakdown-wrap">
        <h3 className="admin-breakdown-title">Receita por procedimento</h3>
        <div className="admin-breakdown-list">
          {breakdown.map(b => {
            const pct = totalRev > 0 ? Math.round((b.revenue / totalRev) * 100) : 0;
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
