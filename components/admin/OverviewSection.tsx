'use client';

import { useEffect, useState } from 'react';
import {
  ADMIN_APPOINTMENTS,
  getTotalRevenue,
  getTicketMedio,
  getWeekdayCounts,
  getNextAppointment,
} from '@/lib/admin-data';

const TODAY = '2026-03-04';
const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function fmtCurrency(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR');
}

export default function OverviewSection() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const totalMonth = ADMIN_APPOINTMENTS.filter(a => a.status !== 'cancelado').length;
  const todayApts  = ADMIN_APPOINTMENTS.filter(a => a.date === TODAY && a.status !== 'cancelado').length;
  const totalRev   = getTotalRevenue();
  const ticket     = getTicketMedio();
  const next       = getNextAppointment();
  const counts     = getWeekdayCounts();
  const maxCount   = Math.max(...counts, 1);

  const metrics = [
    {
      label: 'Agendamentos no mês',
      value: String(totalMonth),
      sub: 'março 2026',
      accent: false,
    },
    {
      label: 'Receita acumulada',
      value: fmtCurrency(totalRev),
      sub: 'confirmados',
      accent: true,
    },
    {
      label: 'Agendamentos hoje',
      value: String(todayApts),
      sub: '4 de março',
      accent: false,
    },
    {
      label: 'Próximo horário',
      value: next ? next.time : '—',
      sub: next ? next.patient : 'nenhum',
      accent: false,
    },
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

      {/* Bar chart */}
      <div className="admin-chart-wrap">
        <div className="admin-chart-header">
          <h3 className="admin-chart-title">Agendamentos por dia da semana</h3>
          <p className="admin-chart-sub">março 2026 — confirmados + pendentes</p>
        </div>
        <div className="admin-chart-body">
          <svg
            className="admin-chart-svg"
            viewBox="0 0 420 180"
            preserveAspectRatio="none"
          >
            {counts.map((c, i) => {
              const barH = animated ? Math.round((c / maxCount) * 120) : 0;
              const x    = i * 70 + 10;
              const y    = 140 - barH;
              return (
                <g key={i}>
                  {/* Background track */}
                  <rect x={x} y={20} width={50} height={120} rx="3" fill="rgba(29,92,58,0.05)" />
                  {/* Filled bar */}
                  <rect
                    x={x}
                    y={y}
                    width={50}
                    height={barH}
                    rx="3"
                    className={`admin-chart-bar${c === maxCount ? ' peak' : ''}`}
                    style={{ transition: `y .8s cubic-bezier(0,0,.2,1) ${i * 0.07}s, height .8s cubic-bezier(0,0,.2,1) ${i * 0.07}s` }}
                  />
                  {/* Count label */}
                  <text x={x + 25} y={y - 6} textAnchor="middle" className="admin-chart-count">
                    {animated ? c : ''}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* X-axis labels */}
          <div className="admin-chart-labels">
            {WEEKDAY_LABELS.map(l => (
              <span key={l}>{l}</span>
            ))}
          </div>
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
              <span className={`admin-recent-badge ${a.status}`}>
                {a.status}
              </span>
              <span className="admin-recent-price">{a.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
