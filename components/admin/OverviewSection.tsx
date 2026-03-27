'use client';

import { useState, useEffect } from 'react';
import { getAllAppointments, AdminAppointment } from '@/lib/admin-data';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const TODAY_STR     = new Date().toISOString().slice(0, 10);
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

function computeMetrics(apts: AdminAppointment[]) {
  const totalMonth  = apts.filter(a => a.status !== 'cancelado').length;
  const todayApts   = apts.filter(a => a.date === TODAY_STR && a.status !== 'cancelado').length;
  const confirmed   = apts.filter(a => a.status === 'confirmado');
  const totalRev    = confirmed.reduce((s, a) => s + a.priceNum, 0);

  const upcoming = apts
    .filter(a => a.date >= TODAY_STR && a.status !== 'cancelado')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const next = upcoming[0] || null;

  const weekCounts = [0, 0, 0, 0, 0, 0];
  for (const a of apts) {
    if (a.status === 'cancelado') continue;
    const wd = new Date(a.date + 'T12:00:00').getDay();
    if (wd >= 1 && wd <= 6) weekCounts[wd - 1]++;
  }

  return { totalMonth, todayApts, totalRev, next, weekCounts };
}

export default function OverviewSection() {
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
          <h2 className="admin-section-title">Visão Geral</h2>
        </div>
        <div className="admin-loading">Carregando dados...</div>
      </div>
    );
  }

  const { totalMonth, todayApts, totalRev, next, weekCounts } = computeMetrics(apts);
  const maxCount  = Math.max(...weekCounts, 1);
  const chartData = weekCounts.map((c, i) => ({ name: WEEKDAY_LABELS[i], value: c }));

  const todayLabel = new Date(TODAY_STR + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const monthLabel = new Date(TODAY_STR + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const metrics = [
    { label: 'Agendamentos no mês',  value: String(totalMonth),    sub: monthLabel,                    accent: false },
    { label: 'Receita acumulada',    value: fmtCurrency(totalRev), sub: 'confirmados',                 accent: true  },
    { label: 'Agendamentos hoje',    value: String(todayApts),     sub: todayLabel,                    accent: false },
    { label: 'Próximo horário',      value: next ? next.time : '—', sub: next ? next.patient : 'nenhum', accent: false },
  ];

  const recent = [...apts].reverse().slice(0, 6);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Visão Geral</h2>
        <p className="admin-section-sub">{monthLabel} · atualizado agora</p>
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
            <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 20, right: 8, bottom: 4, left: -20 }}>
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
          {recent.map(a => (
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
