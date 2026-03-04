'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { PLANS, type Plan } from '@/lib/subscription-data';

export default function AssinaturaPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [selected, setSelected] = useState<Plan | null>(null);
  const [step, setStep]         = useState<'select' | 'payment'>('select');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName]     = useState('');
  const [cardExp, setCardExp]       = useState('');
  const [cardCvv, setCardCvv]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/cadastro');
    } else if (user.plan && user.planStatus === 'ativo') {
      router.replace('/minha-conta');
    }
  }, [user, router]);

  function handleSelectPlan(plan: Plan) {
    setSelected(plan);
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatCardNumber(val: string) {
    const nums = val.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatExp(val: string) {
    const nums = val.replace(/\D/g, '').slice(0, 4);
    if (nums.length > 2) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!selected) return;
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Número do cartão inválido.');
      return;
    }
    if (cardExp.length < 5) {
      setError('Data de validade inválida.');
      return;
    }
    if (cardCvv.length < 3) {
      setError('CVV inválido.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const today = new Date();
      const next = new Date(today);
      next.setMonth(next.getMonth() + 1);

      updateUser({
        plan: selected.id,
        planStatus: 'ativo',
        subscriptionDate: today.toISOString().split('T')[0],
        nextBillingDate: next.toISOString().split('T')[0],
        monthlyValue: selected.price,
      });

      router.push('/minha-conta');
    }, 1500);
  }

  if (!user) return null;

  return (
    <div className="sub-layout">
      {/* Header */}
      <header className="sub-header">
        <div className="container">
          <div className="sub-header-inner">
            <Link href="/" className="sub-logo">
              <span className="sub-logo-text">Lumière</span>
              <span className="logo-dot" />
            </Link>
            {step === 'payment' ? (
              <button className="sub-back-link" onClick={() => setStep('select')}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar aos planos
              </button>
            ) : (
              <Link href="/" className="sub-back-link">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar ao site
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container">
        <div className="sub-content">
          {step === 'select' ? (
            <>
              <h1 className="sub-title">
                Escolha seu <em>plano</em>
              </h1>
              <p className="sub-subtitle">
                Assinatura mensal com cobrança automática no cartão de crédito.
                Cancele quando quiser.
              </p>

              <div className="sub-plans">
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    className={`sub-plan-card${plan.popular ? ' popular' : ''}`}
                  >
                    {plan.popular && <span className="sub-plan-badge">Recomendado</span>}
                    <h3 className="sub-plan-name">{plan.name}</h3>
                    <div className="sub-plan-price">
                      <span className="sub-plan-price-value">{plan.price}</span>
                      <span className="sub-plan-price-period">/mês</span>
                    </div>
                    <p className="sub-plan-desc">{plan.desc}</p>
                    <ul className="sub-plan-features">
                      {plan.features.map(f => (
                        <li key={f}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`sub-plan-cta${plan.popular ? ' primary' : ''}`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      Selecionar plano
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="sub-payment-wrap">
              <div className="sub-payment-summary">
                <p className="sub-payment-summary-label">Plano selecionado</p>
                <h3 className="sub-payment-summary-name">{selected?.name}</h3>
                <div className="sub-payment-summary-price">
                  <span className="sub-payment-summary-value">{selected?.price}</span>
                  <span className="sub-payment-summary-period">/mês</span>
                </div>
                <ul className="sub-payment-summary-features">
                  {selected?.features.map(f => (
                    <li key={f}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="sub-change-plan" onClick={() => setStep('select')}>
                  Trocar plano
                </button>
              </div>

              <form className="sub-payment-form" onSubmit={handleSubmit}>
                <h2 className="sub-payment-title">Dados do cartão</h2>
                <p className="sub-payment-sub">Cobrança mensal recorrente. Cancele a qualquer momento.</p>

                <div className="sub-card-fields">
                  <div className="sub-card-field">
                    <label className="na-label">Nome no cartão</label>
                    <input
                      type="text"
                      className="na-input"
                      placeholder="Como está no cartão"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sub-card-field">
                    <label className="na-label">Número do cartão</label>
                    <input
                      type="text"
                      className="na-input"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      required
                    />
                  </div>

                  <div className="sub-card-row">
                    <div className="sub-card-field">
                      <label className="na-label">Validade</label>
                      <input
                        type="text"
                        className="na-input"
                        placeholder="MM/AA"
                        value={cardExp}
                        onChange={e => setCardExp(formatExp(e.target.value))}
                        required
                      />
                    </div>
                    <div className="sub-card-field">
                      <label className="na-label">CVV</label>
                      <input
                        type="text"
                        className="na-input"
                        placeholder="123"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="login-error">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`sub-pay-btn${loading ? ' loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="login-spinner" />
                        Processando...
                      </>
                    ) : (
                      <>Assinar por {selected?.price}/mês</>
                    )}
                  </button>
                </div>

                <p className="sub-secure-note">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  Pagamento seguro com criptografia de ponta a ponta
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
