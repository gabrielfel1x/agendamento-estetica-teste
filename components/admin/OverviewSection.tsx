'use client';

import { useState, useEffect, useMemo } from 'react';
import { createStaffClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function fmtCurrency(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR');
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-value">{payload[0].value} agendamentos</p>
    </div>
  );
}

interface Apt {
  id:        string;
  patient:   string;
  procedure: string;
  price_num: number;
  price:     string;
  date:      string; // YYYY-MM-DD
  time:      string; // HH:MM
  status:    string;
}

interface DashboardData {
  monthApts:     Apt[];
  nextApt:       Apt | null;
  recentApts:    Apt[];
  totalClientes: number;
}

function normalizeApt(row: any): Apt {
  return {
    id:        row.id,
    patient:   row.patient,
    procedure: row.procedure,
    price_num: row.price_num ?? 0,
    price:     row.price ?? '',
    date:      String(row.date).slice(0, 10),
    time:      String(row.time).substring(0, 5),
    status:    row.status,
  };
}

async function fetchDashboard(supabase: SupabaseClient): Promise<DashboardData> {
  const now       = new Date();
  const todayStr  = now.toISOString().slice(0, 10);
  const year      = now.getFullYear();
  const month     = now.getMonth() + 1;
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay   = new Date(year, month, 0).getDate();
  const monthEnd  = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const [monthRes, nextRes, recentRes, clientesRes] = await Promise.all([
    // All appointments for current month
    supabase
      .from('appointments')
      .select('id, patient, procedure, price_num, price, date, time, status')
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date')
      .order('time'),

    // Next upcoming non-cancelled appointment (from today)
    supabase
      .from('appointments')
      .select('id, patient, procedure, price_num, price, date, time, status')
      .gte('date', todayStr)
      .neq('status', 'cancelado')
      .order('date')
      .order('time')
      .limit(1),

    // Last 8 appointments across all time
    supabase
      .from('appointments')
      .select('id, patient, procedure, price_num, price, date, time, status')
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .limit(8),

    // Total clients count
    (supabase as any)
      .from('clientes')
      .select('id', { count: 'exact', head: true }),
  ]);

  if (monthRes.error)   console.error('[dashboard] monthApts:', monthRes.error.message);
  if (nextRes.error)    console.error('[dashboard] nextApt:', nextRes.error.message);
  if (recentRes.error)  console.error('[dashboard] recentApts:', recentRes.error.message);
  if (clientesRes.error) console.error('[dashboard] clientes:', clientesRes.error.message);

  return {
    monthApts:     ((monthRes.data  ?? []) as any[]).map(normalizeApt),
    nextApt:       nextRes.data?.[0] ? normalizeApt(nextRes.data[0]) : null,
    recentApts:    ((recentRes.data ?? []) as any[]).map(normalizeApt),
    totalClientes: (clientesRes as any).count ?? 0,
  };
}

export default function OverviewSection() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const staffClient = useMemo(() => createStaffClient(), []);

  useEffect(() => {
    fetchDashboard(staffClient).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [staffClient]);

  const now        = new Date();
  const todayStr   = now.toISOString().slice(0, 10);
  const todayLabel = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (loading || !data) {
    return (
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Visão Geral</h2>
          <p className="admin-section-sub">{monthLabel}</p>
        </div>
        <div className="admin-loading">Carregando dados...</div>
      </div>
    );
  }

  const { monthApts, nextApt, recentApts, totalClientes } = data;

  const active     = monthApts.filter(a => a.status !== 'cancelado');
  const totalMonth = active.length;
  const totalRev   = monthApts
    .filter(a => a.status === 'confirmado')
    .reduce((s, a) => s + a.price_num, 0);
  const todayCount = active.filter(a => a.date === todayStr).length;

  // Weekday distribution (Mon–Sat) for current month
  const weekCounts = [0, 0, 0, 0, 0, 0];
  for (const a of active) {
    const wd = new Date(a.date + 'T12:00:00').getDay();
    if (wd >= 1 && wd <= 6) weekCounts[wd - 1]++;
  }
  const maxCount  = Math.max(...weekCounts, 1);
  const chartData = weekCounts.map((c, i) => ({ name: WEEKDAY_LABELS[i], value: c }));

  const metrics = [
    {
      label:  'Agendamentos no mês',
      value:  String(totalMonth),
      sub:    monthLabel,
      accent: false,
    },
    {
      label:  'Receita do mês',
      value:  fmtCurrency(totalRev),
      sub:    'confirmados',
      accent: true,
    },
    {
      label:  'Agendamentos hoje',
      value:  String(todayCount),
      sub:    todayLabel,
      accent: false,
    },
    {
      label:  'Próximo horário',
      value:  nextApt ? nextApt.time : '—',
      sub:    nextApt ? nextApt.patient : 'nenhum pendente',
      accent: false,
    },
  ];

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Visão Geral</h2>
        <p className="admin-section-sub">
          {monthLabel} · {totalClientes} cliente{totalClientes !== 1 ? 's' : ''} cadastrado{totalClientes !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="admin-metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className={`admin-metric-card${m.accent ? ' accent' : ''}`}>
            <p className="admin-metric-label">{m.label}</p>
            <p className="admin-metric-value">{m.value}</p>
            <p className="admin-metric-sub">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="admin-chart-wrap">
        <div className="admin-chart-header">
          <h3 className="admin-chart-title">Agendamentos por dia da semana</h3>
          <p className="admin-chart-sub">{monthLabel} — confirmados + pendentes</p>
        </div>
        <div className="admin-chart-body" style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barCategoryGap="20%"
              margin={{ top: 20, right: 8, bottom: 4, left: -20 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#8f8f87', fontFamily: 'var(--font-outfit), system-ui' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#8f8f87', fontFamily: 'var(--font-outfit), system-ui' }}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(201,168,76,0.06)', radius: 6 }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800} animationEasing="ease-out">
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.value === maxCount ? '#c9a84c' : '#f7f2e8'}
                    stroke={entry.value === maxCount ? '#c9a84c' : '#e8e4da'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-recent-wrap">
        <h3 className="admin-recent-title">Agendamentos recentes</h3>
        <div className="admin-recent-list">
          {recentApts.length === 0 ? (
            <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', fontWeight: 300, padding: '8px 0' }}>
              Nenhum agendamento encontrado.
            </p>
          ) : recentApts.map(a => (
            <div key={a.id} className="admin-recent-row">
              <span className="admin-recent-time">{a.time}</span>
              <span className="admin-recent-name">{a.patient}</span>
              <span className="admin-recent-proc">{a.procedure}</span>
              <span className={`admin-recent-badge ${a.status}`}>{a.status}</span>
              <span className="admin-recent-price">{a.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
