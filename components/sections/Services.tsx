'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { PROCEDURE_CATALOG } from '@/lib/constants';

const CATS = [
  { id: 'todos',    label: 'Todos os serviços' },
  { id: 'facial',   label: 'Facial'            },
  { id: 'corporal', label: 'Corporal'           },
  { id: 'laser',    label: 'Depilação a laser'  },
  { id: 'especiais',label: 'Especiais'          },
];

const CAT_MAP: Record<string, string> = {
  'Limpeza de pele':                       'facial',
  'Drenagem facial':                       'facial',
  'Revitalização facial':                  'facial',
  'Rejuvenescimento facial':               'facial',
  'Tratamento para flacidez':              'facial',
  'Revitalização labial':                  'facial',
  'Drenagem linfática':                    'corporal',
  'Dreno modeladora':                      'corporal',
  'Modeladora':                            'corporal',
  'Detox corporal':                        'corporal',
  'Massagem relaxante':                    'corporal',
  'Massagem relaxante c/ pedras quentes':  'corporal',
  'Pós operatório':                        'corporal',
  'Ozônioterapia':                         'corporal',
  'Ventosa terapia':                       'corporal',
  'Liberação':                             'corporal',
  'Tratamento para celulite':              'corporal',
  'Tratamento para gordura localizada':    'corporal',
  'Depilação a laser — Perna completa':    'laser',
  'Depilação a laser — Meia perna':        'laser',
  'Depilação a laser — Axila':             'laser',
  'Depilação a laser — Peitoral e tronco': 'laser',
  'Depilação a laser — Contorno simples':  'laser',
  'Depilação a laser — Contorno completo': 'laser',
  'Depilação a laser — Barba':             'laser',
  'Terapia capilar':                       'especiais',
  'Spa dos pés':                           'especiais',
  'Pacote Emagrecimento e Hipertrofia':    'especiais',
};

const CAT_LABELS: Record<string, string> = {
  facial:    'Facial',
  corporal:  'Corporal',
  laser:     'Laser',
  especiais: 'Especial',
};

export default function Services() {
  const [active, setActive] = useState('todos');
  const trackRef = useRef<HTMLDivElement>(null);

  const filtered = PROCEDURE_CATALOG.filter(s =>
    active === 'todos' || CAT_MAP[s.name] === active
  );

  function scroll(dir: 'left' | 'right') {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  }

  return (
    <section id="services">
      <div className="svc-wrap">

        {/* ── Left panel ──────────────────────────────── */}
        <div className="svc-panel reveal-left">
          <p className="section-label">Tabela de serviços</p>
          <h2 className="section-title svc-heading">
            Tudo o que<br />fazemos <em>por você.</em>
          </h2>
          <p className="svc-desc">
            Escolha o serviço e agende diretamente pela plataforma.
            Atendimento personalizado em cada sessão.
          </p>

          <nav className="svc-tabs" aria-label="Filtrar serviços">
            {CATS.map(c => (
              <button
                key={c.id}
                className={`svc-tab${active === c.id ? ' active' : ''}`}
                onClick={() => setActive(c.id)}
              >
                <span className="svc-tab-dot" />
                {c.label}
              </button>
            ))}
          </nav>

          <div className="svc-arrows">
            <button className="svc-arrow" onClick={() => scroll('left')} aria-label="Anterior">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="svc-arrow" onClick={() => scroll('right')} aria-label="Próximo">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <span className="svc-count">{filtered.length} serviços</span>
          </div>
        </div>

        {/* ── Right: carousel ─────────────────────────── */}
        <div className="svc-track-wrap">
          <div className="svc-track" ref={trackRef}>
            {filtered.map((svc, i) => {
              const cat = CAT_MAP[svc.name];
              const catLabel = CAT_LABELS[cat] ?? 'Especial';
              const isPackage = svc.name.toLowerCase().includes('pacote');
              return (
                <div className={`svc-card${isPackage ? ' svc-card--pkg' : ''}`} key={svc.name}>
                  <div className="svc-card-header">
                    <span className="svc-card-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="svc-card-tag">{catLabel}</span>
                  </div>

                  <h3 className="svc-card-name">{svc.name}</h3>

                  <div className="svc-card-footer">
                    <p className="svc-card-price">{svc.price}</p>
                    <Link href="/cadastro" className="svc-card-btn">
                      Agendar
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fade edge */}
          <div className="svc-fade" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
