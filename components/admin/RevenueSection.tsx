'use client';

import { useState, useEffect, useMemo } from 'react';
import { createStaffClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

type Period = 'semana' | 'mes' | 'trimestre';

function fmtCurrency(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR');
}

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();

  if (period === 'semana') {
    const day = now.getDay(); // 0=Dom
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return {
      from: mon.toISOString().slice(0, 10),
      to:   sun.toISOString().slice(0, 10),
    };
  }

  if (period === 'mes') {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const last = new Date(y, m, 0).getDate();
    return {
      from: `${y}-${String(m).padStart(2, '0')}-01`,
      to:   `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`,
    };
  }

  // trimestre — trimestre calendário atual (Q1: jan-mar, Q2: abr-jun, etc.)
  const y  = now.getFullYear();
  const q  = Math.floor(now.getMonth() / 3); // 0..3
  const m1 = q * 3 + 1; // primeiro mês do trimestre
  const m3 = m1 + 2;    // terceiro mês do trimestre
  const last = new Date(y, m3, 0).getDate();
  return {
    from: `${y}-${String(m1).padStart(2, '0')}-01`,
    to:   `${y}-${String(m3).padStart(2, '0')}-${String(last).padStart(2, '0')}`,
  };
}

interface Apt {
  procedure: string;
  price_num: number;
  status:    string;
}

interface PeriodData {
  apts:    Apt[];
  from:    string;
  to:      string;
}

async function fetchPeriodData(period: Period, supabase: SupabaseClient): Promise<PeriodData> {
  const { from, to } = getDateRange(period);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('appointments')
    .select('procedure, price_num, status')
    .gte('date', from)
    .lte('date', to);

  if (error) console.error('[revenue] fetchPeriodData:', error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apts: Apt[] = ((data ?? []) as any[]).map(r => ({
    procedure: r.procedure,
    price_num: r.price_num ?? 0,
    status:    r.status,
  }));

  return { apts, from, to };
}

function computeStats(apts: Apt[]) {
  const total     = apts.length;
  const confirmed = apts.filter(a => a.status === 'confirmado');
  const cancelled = apts.filter(a => a.status === 'cancelado').length;
  const active    = total - cancelled;

  const revenue  = confirmed.reduce((s, a) => s + a.price_num, 0);
  const ticket   = confirmed.length ? Math.round(revenue / confirmed.length) : 0;
  const confRate = active > 0 ? Math.round((confirmed.length / active) * 100) : 0;

  const procMap: Record<string, { revenue: number; count: number }> = {};
  for (const a of confirmed) {
    if (!procMap[a.procedure]) procMap[a.procedure] = { revenue: 0, count: 0 };
    procMap[a.procedure].revenue += a.price_num;
    procMap[a.procedure].count++;
  }
  const breakdown = Object.entries(procMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  const mostBooked = breakdown[0] ?? { name: '—', count: 0 };

  return { revenue, ticket, confRate, breakdown, mostBooked, confirmedCount: confirmed.length, totalActive: active };
}

const PERIOD_LABEL: Record<Period, string> = {
  semana:    'da semana',
  mes:       'do mês',
  trimestre: 'do trimestre',
};

export default function RevenueSection() {
  const [period, setPeriod]   = useState<Period>('mes');
  const [data,   setData]     = useState<PeriodData | null>(null);
  const [loading, setLoading] = useState(true);
  const staffClient = useMemo(() => createStaffClient(), []);

  useEffect(() => {
    setLoading(true);
    fetchPeriodData(period, staffClient).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [period, staffClient]);

  const stats = data ? computeStats(data.apts) : null;

  // Formata range de datas para exibição
  function fmtRange(from: string, to: string) {
    const f = new Date(from + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    const t = new Date(to   + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${f} – ${t}`;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Receita</h2>
        <p className="admin-section-sub">
          {data ? fmtRange(data.from, data.to) : 'Carregando...'}
        </p>
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

      {loading ? (
        <div className="admin-loading">Carregando dados...</div>
      ) : stats && (
        <>
          <div className="admin-revenue-hero">
            <p className="admin-revenue-hero-label">
              Receita {PERIOD_LABEL[period]}
            </p>
            <p className="admin-revenue-hero-value">{fmtCurrency(stats.revenue)}</p>
            <p className="admin-revenue-hero-sub">
              {stats.confirmedCount} agendamento{stats.confirmedCount !== 1 ? 's' : ''} confirmado{stats.confirmedCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="admin-revenue-cards">
            <div className="admin-revenue-card">
              <p className="admin-revenue-card-label">Ticket médio</p>
              <p className="admin-revenue-card-value">{fmtCurrency(stats.ticket)}</p>
              <p className="admin-revenue-card-sub">por agendamento confirmado</p>
            </div>
            <div className="admin-revenue-card">
              <p className="admin-revenue-card-label">Procedimento líder</p>
              <p className="admin-revenue-card-value-sm">{stats.mostBooked.name}</p>
              <p className="admin-revenue-card-sub">{stats.mostBooked.count} confirmado{stats.mostBooked.count !== 1 ? 's' : ''}</p>
            </div>
            <div className="admin-revenue-card">
              <p className="admin-revenue-card-label">Taxa de confirmação</p>
              <p className="admin-revenue-card-value">{stats.confRate}%</p>
              <p className="admin-revenue-card-sub">de {stats.totalActive} agendamento{stats.totalActive !== 1 ? 's' : ''} ativos</p>
            </div>
          </div>

          <div className="admin-breakdown-wrap">
            <h3 className="admin-breakdown-title">Receita por procedimento</h3>
            {stats.breakdown.length === 0 ? (
              <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                Nenhum agendamento confirmado neste período.
              </p>
            ) : (
              <div className="admin-breakdown-list">
                {stats.breakdown.map(b => {
                  const pct = stats.revenue > 0 ? Math.round((b.revenue / stats.revenue) * 100) : 0;
                  return (
                    <div key={b.name} className="admin-breakdown-row">
                      <div className="admin-breakdown-info">
                        <p className="admin-breakdown-name">{b.name}</p>
                        <p className="admin-breakdown-count">{b.count} confirmado{b.count !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="admin-breakdown-bar-wrap">
                        <div className="admin-breakdown-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="admin-breakdown-rev">{fmtCurrency(b.revenue)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
