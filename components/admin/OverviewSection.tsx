'use client';

import {
  ADMIN_APPOINTMENTS,
  getTotalRevenue,
  getTicketMedio,
  getWeekdayCounts,
  getNextAppointment,
} from '@/lib/admin-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const TODAY = '2026-03-04';
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

export default function OverviewSection() {
  const totalMonth = ADMIN_APPOINTMENTS.filter(a => a.status !== 'cancelado').length;
  const todayApts  = ADMIN_APPOINTMENTS.filter(a => a.date === TODAY && a.status !== 'cancelado').length;
  const totalRev   = getTotalRevenue();
  const next       = getNextAppointment();
  const counts     = getWeekdayCounts();
  const maxCount   = Math.max(...counts, 1);

  const chartData = counts.map((c, i) => ({
    name: WEEKDAY_LABELS[i],
    value: c,
  }));

  const metrics = [
    { label: 'Agendamentos no mês', value: String(totalMonth), sub: 'março 2026', accent: false },
    { label: 'Receita acumulada', value: fmtCurrency(totalRev), sub: 'confirmados', accent: true },
    { label: 'Agendamentos hoje', value: String(todayApts), sub: '4 de março', accent: false },
    { label: 'Próximo horário', value: next ? next.time : '—', sub: next ? next.patient : 'nenhum', accent: false },
  ];

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Visão Geral</h2>
        <p className="admin-section-sub">Março 2026 · atualizado agora</p>
      </div>

      {/* Metric cards */}
      <div className="admin-metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className={`admin-metric-card${m.accent ? ' accent' : ''}`}>
            <p className="admin-metric-label">{m.label}</p>
            <p className="admin-metric-value">{m.value}</p>
            <p className="admin-metric-sub">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart — Recharts */}
      <div className="admin-chart-wrap">
        <div className="admin-chart-header">
          <h3 className="admin-chart-title">Agendamentos por dia da semana</h3>
          <p className="admin-chart-sub">março 2026 — confirmados + pendentes</p>
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

      {/* Recent list */}
      <div className="admin-recent-wrap">
        <h3 className="admin-recent-title">Agendamentos recentes</h3>
        <div className="admin-recent-list">
          {ADMIN_APPOINTMENTS.slice(0, 6).map(a => (
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
