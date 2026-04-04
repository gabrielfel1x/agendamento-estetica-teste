'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getPlans, type PlanData } from '@/lib/plans-data';

export default function Plans() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    getPlans(createClient()).then(plans => {
      const active = plans.find(p => p.active) ?? plans[0] ?? null;
      setPlan(active);
    });
  }, []);

  const pacoteHref = !user ? '/cadastro' : '/assinatura';

  if (!plan) return null;

  return (
    <section id="plans">
      <div className="container">
        <div className="plans-header reveal">
          <p className="section-label">Pacote especial</p>
          <h2 className="section-title">
            {plan.name.includes('&') ? (
              <>
                {plan.name.split('&')[0].trim()} &<br />
                <em>{plan.name.split('&')[1].trim()}.</em>
              </>
            ) : (
              <em>{plan.name}.</em>
            )}
          </h2>
        </div>
        {plan.description && (
          <p className="section-sub plans-sub reveal d2">{plan.description}</p>
        )}

        <div className="pkg-grid reveal d2">
          <div className="pkg-card">
            <span className="pkg-badge">Pacote exclusivo</span>
            <h3 className="pkg-name">
              {plan.name.includes('&') ? (
                <>
                  {plan.name.split('&')[0].trim()} &<br />
                  <em>{plan.name.split('&')[1].trim()}</em>
                </>
              ) : (
                <em>{plan.name}</em>
              )}
            </h3>
            <ul className="pkg-items">
              {plan.features.map(item => (
                <li key={item}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <hr className="pkg-divider" />
            <div className="pkg-price">
              <p className="pkg-price-main">12x de <strong>R$ {Math.ceil(plan.priceNum / 12)},99</strong></p>
              <p className="pkg-price-alt">ou {plan.price} à vista</p>
            </div>
            <Link href={pacoteHref} className="pkg-cta">
              Quero este pacote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
