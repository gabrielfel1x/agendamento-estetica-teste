'use client';

import { useState } from 'react';
import { getAppointmentsByDay, getOccupancyByDate } from '@/lib/admin-data';

const WEEKDAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TODAY = '2026-03-04';

// March 2026 starts on Sunday (day 0)
function buildMarchDays() {
  const days: (number | null)[] = [];
  // March 1, 2026 is a Sunday → offset 0
  for (let i = 0; i < 31; i++) days.push(i + 1);
  // pad end to complete last week
  while ((days.length) % 7 !== 0) days.push(null);
  return days;
}

function formatDateLabel(day: number) {
  const d = String(day).padStart(2, '0');
  return `2026-03-${d}`;
}

function formatDisplayDate(dateStr: string) {
  const [, , d] = dateStr.split('-');
  const days = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const date = new Date(dateStr + 'T12:00:00');
  return `${days[date.getDay()]}, ${parseInt(d)} de março`;
}

function getOccupancyLevel(count: number): 'empty' | 'low' | 'medium' | 'high' {
  if (!count) return 'empty';
  if (count <= 1) return 'low';
  if (count <= 2) return 'medium';
  return 'high';
}

export default function CalendarSection() {
  const [selectedDay, setSelectedDay] = useState<number | null>(4); // today
  const days = buildMarchDays();
  const occupancy = getOccupancyByDate();

  const selectedDateStr = selectedDay ? formatDateLabel(selectedDay) : null;
  const selectedApts = selectedDateStr ? getAppointmentsByDay(selectedDateStr) : [];

  function waLink(phone: string, patient: string) {
    const clean = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${patient}! Entrando em contato da Clínica Lumière sobre seu agendamento.`);
    return `https://wa.me/55${clean}?text=${msg}`;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Calendário</h2>
        <p className="admin-section-sub">Março 2026 · clique em um dia para ver os agendamentos</p>
      </div>

      <div className="admin-cal-wrap">
        {/* Calendar */}
        <div className="admin-cal">
          <div className="admin-cal-month">Março 2026</div>

          {/* Weekday headers */}
          <div className="admin-cal-grid">
            {WEEKDAY_HEADERS.map(h => (
              <div key={h} className="admin-cal-wday">{h}</div>
            ))}

            {days.map((d, i) => {
              if (!d) return <div key={`e-${i}`} className="admin-cal-day empty" />;
              const dateStr = formatDateLabel(d);
              const count = occupancy[dateStr] || 0;
              const level = getOccupancyLevel(count);
              const isToday = dateStr === TODAY;
              const isSelected = d === selectedDay;
              const isPast = dateStr < TODAY;

              return (
                <button
                  key={d}
                  className={[
                    'admin-cal-day',
                    level,
                    isToday ? 'today' : '',
                    isSelected ? 'selected' : '',
                    isPast ? 'past' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedDay(d)}
                >
                  <span className="admin-cal-day-n">{d}</span>
                  {count > 0 && (
                    <span className="admin-cal-occ">
                      {Array.from({ length: Math.min(count, 4) }).map((_, j) => (
                        <span key={j} className="admin-cal-occ-bar" />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="admin-cal-legend">
            <span className="admin-cal-legend-item">
              <span className="admin-cal-legend-dot low" /> 1 agendamento
            </span>
            <span className="admin-cal-legend-item">
              <span className="admin-cal-legend-dot medium" /> 2 agendamentos
            </span>
            <span className="admin-cal-legend-item">
              <span className="admin-cal-legend-dot high" /> 3+ agendamentos
            </span>
          </div>
        </div>

        {/* Day panel */}
        {selectedDay && (
          <div className="admin-day-panel">
            <div className="admin-day-panel-header">
              <h3 className="admin-day-panel-title">
                {selectedDateStr ? formatDisplayDate(selectedDateStr) : ''}
              </h3>
              <span className="admin-day-panel-count">
                {selectedApts.length} {selectedApts.length === 1 ? 'agendamento' : 'agendamentos'}
              </span>
            </div>

            {selectedApts.length === 0 ? (
              <div className="admin-day-empty">
                <p>Nenhum agendamento neste dia.</p>
              </div>
            ) : (
              <div className="admin-day-list">
                {selectedApts.map(a => (
                  <div key={a.id} className="admin-day-row">
                    <div className="admin-day-row-time">
                      <span className="admin-day-time">{a.time}</span>
                    </div>
                    <div className="admin-day-row-info">
                      <p className="admin-day-patient">{a.patient}</p>
                      <p className="admin-day-proc">{a.procedure}</p>
                    </div>
                    <div className="admin-day-row-right">
                      <span className="admin-day-price">{a.price}</span>
                      <a
                        href={waLink(a.phone, a.patient)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-wa-btn"
                        title={`Falar com ${a.patient} no WhatsApp`}
                      >
                        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    </div>
                    <span className={`admin-day-badge ${a.status}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
