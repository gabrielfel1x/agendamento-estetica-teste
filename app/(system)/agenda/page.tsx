'use client';

import { useState, useCallback } from 'react';
import { getAppointmentsByDay, getOccupancyByDate, AdminAppointment } from '@/lib/admin-data';
import { ALL_TIMES } from '@/lib/constants';
import NovoAgendamentoModal from '@/components/system/NovoAgendamentoModal';

const TODAY_STR = '2026-03-04';
const WEEKDAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDateLabel(day: number) {
  return `2026-03-${String(day).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr: string) {
  const [, , d] = dateStr.split('-');
  const days = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const date = new Date(dateStr + 'T12:00:00');
  return `${days[date.getDay()]}, ${parseInt(d)} de março`;
}

function getOccupancyLevel(count: number): string {
  if (!count) return 'empty';
  if (count <= 1) return 'low';
  if (count <= 2) return 'medium';
  return 'high';
}

function buildMarchDays(): (number | null)[] {
  // March 2026 starts on Sunday
  const days: (number | null)[] = Array.from({ length: 31 }, (_, i) => i + 1);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function waLink(phone: string, patient: string) {
  const clean = phone.replace(/\D/g, '');
  const msg = encodeURIComponent(`Olá ${patient}! Entrando em contato da Clínica Lumière.`);
  return `https://wa.me/55${clean}?text=${msg}`;
}

export default function AgendaPage() {
  const [selectedDay, setSelectedDay]   = useState<number>(4); // today
  const [modalOpen, setModalOpen]       = useState(false);
  const [refreshKey, setRefreshKey]     = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const days       = buildMarchDays();
  const occupancy  = getOccupancyByDate();
  const selectedDateStr = formatDateLabel(selectedDay);
  const dayApts    = getAppointmentsByDay(selectedDateStr);

  // Build time slots: all times + booked ones
  const aptsByTime: Record<string, AdminAppointment> = {};
  for (const a of dayApts) aptsByTime[a.time] = a;

  return (
    <div className="admin-section agenda-page">
      {/* Header */}
      <div className="agenda-header">
        <div>
          <h2 className="admin-section-title">Agenda</h2>
          <p className="admin-section-sub">Março 2026 · clique em um dia para ver os horários</p>
        </div>
        <button className="agenda-new-btn" onClick={() => setModalOpen(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Agendamento
        </button>
      </div>

      <div className="agenda-layout">
        {/* Calendar */}
        <div className="admin-cal">
          <div className="admin-cal-month">Março 2026</div>
          <div className="admin-cal-grid">
            {WEEKDAY_HEADERS.map(h => (
              <div key={h} className="admin-cal-wday">{h}</div>
            ))}
            {days.map((d, i) => {
              if (!d) return <div key={`e-${i}`} className="admin-cal-day empty" />;
              const dateStr  = formatDateLabel(d);
              const count    = occupancy[dateStr] || 0;
              const level    = getOccupancyLevel(count);
              const isToday  = dateStr === TODAY_STR;
              const isSel    = d === selectedDay;
              const isPast   = dateStr < TODAY_STR;
              return (
                <button
                  key={d}
                  className={['admin-cal-day', level, isToday ? 'today' : '', isSel ? 'selected' : '', isPast ? 'past' : ''].filter(Boolean).join(' ')}
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
          <div className="admin-cal-legend">
            <span className="admin-cal-legend-item"><span className="admin-cal-legend-dot low" /> 1 ag.</span>
            <span className="admin-cal-legend-item"><span className="admin-cal-legend-dot medium" /> 2 ag.</span>
            <span className="admin-cal-legend-item"><span className="admin-cal-legend-dot high" /> 3+ ag.</span>
          </div>
        </div>

        {/* Day panel */}
        <div className="agenda-day-panel">
          <div className="agenda-day-header">
            <h3 className="agenda-day-title">{formatDisplayDate(selectedDateStr)}</h3>
            <div className="agenda-day-actions">
              <span className="admin-day-panel-count">
                {dayApts.length} {dayApts.length === 1 ? 'agendamento' : 'agendamentos'}
              </span>
              <button
                className="agenda-add-day-btn"
                onClick={() => setModalOpen(true)}
                title="Novo agendamento neste dia"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="agenda-slots">
            {ALL_TIMES.map(time => {
              const apt = aptsByTime[time];
              return (
                <div key={time} className={`agenda-slot${apt ? ' busy' : ' avail'}`}>
                  <span className="agenda-slot-time">{time}</span>
                  {apt ? (
                    <div className="agenda-slot-apt">
                      <div className="agenda-slot-info">
                        <p className="agenda-slot-patient">{apt.patient}</p>
                        <p className="agenda-slot-proc">{apt.procedure}</p>
                      </div>
                      <div className="agenda-slot-right">
                        <span className="agenda-slot-price">{apt.price}</span>
                        <a
                          href={waLink(apt.phone, apt.patient)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-wa-btn"
                          title={`WhatsApp — ${apt.patient}`}
                        >
                          <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                        <span className={`admin-day-badge ${apt.status}`}>{apt.status}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="agenda-slot-empty-btn"
                      onClick={() => setModalOpen(true)}
                      title="Criar agendamento"
                    >
                      <span>disponível</span>
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <NovoAgendamentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDateStr}
        onSaved={refresh}
      />
    </div>
  );
}
