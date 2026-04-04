'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getServicos, getCategories, type Servico, type ServiceCategory } from '@/lib/services-data';

export default function Services() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [servicos,   setServicos]   = useState<Servico[]>([]);
  const [active,     setActive]     = useState('todos');
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const client = createClient();
    Promise.all([getCategories(client), getServicos(client)]).then(([cats, srvs]) => {
      setCategories(cats.filter(c => c.active));
      setServicos(srvs.filter(s => s.active));
    });
  }, []);

  const agendarHref = user ? '/minha-conta' : '/login';

  const filtered: Servico[] = active === 'todos'
    ? servicos
    : servicos.filter(s => s.categoryId === active);

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
            <button
              className={`svc-tab${active === 'todos' ? ' active' : ''}`}
              onClick={() => setActive('todos')}
            >
              <span className="svc-tab-dot" />
              Todos os serviços
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                className={`svc-tab${active === c.id ? ' active' : ''}`}
                onClick={() => setActive(c.id)}
              >
                <span className="svc-tab-dot" />
                {c.name}
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
            {filtered.map((svc, i) => (
              <div className="svc-card" key={svc.id}>
                <div className="svc-card-header">
                  <span className="svc-card-num">{String(i + 1).padStart(2, '0')}</span>
                  {svc.categoryName && (
                    <span className="svc-card-tag">{svc.categoryName}</span>
                  )}
                </div>

                <h3 className="svc-card-name">{svc.name}</h3>

                <div className="svc-card-footer">
                  <p className="svc-card-price">{svc.price}</p>
                  <Link href={agendarHref} className="svc-card-btn">
                    Agendar
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Fade edge */}
          <div className="svc-fade" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
