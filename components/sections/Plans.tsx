import Link from 'next/link';
import { PLANS } from '@/lib/subscription-data';

export default function Plans() {
  return (
    <section id="plans">
      <div className="container">
        <div className="plans-header reveal">
          <p className="section-label">Nossos planos</p>
          <h2 className="section-title">
            Assinatura <em>mensal</em>
            <br />
            com benefícios exclusivos.
          </h2>
        </div>
        <p className="section-sub plans-sub reveal d2">
          Escolha o plano ideal e transforme sua rotina de cuidados
          com condições especiais todo mês.
        </p>

        <div className="plans-grid">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`plan-card${plan.popular ? ' popular' : ''} reveal d${i + 1}`}
            >
              {plan.popular && <span className="plan-badge">Mais popular</span>}

              <h3 className="plan-name">{plan.name}</h3>

              <div className="plan-price">
                <span className="plan-price-value">{plan.price}</span>
                <span className="plan-price-period">/mês</span>
              </div>

              <p className="plan-desc">{plan.desc}</p>

              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/assinatura"
                className={`plan-cta${plan.popular ? ' primary' : ''}`}
              >
                Assinar agora
              </Link>
            </div>
          ))}
        </div>

        <p className="plans-note reveal d4">
          * Procedimentos ilimitados sujeitos a disponibilidade de agenda.
          Todos os planos têm cobrança mensal recorrente no cartão de crédito.
        </p>
      </div>
    </section>
  );
}
