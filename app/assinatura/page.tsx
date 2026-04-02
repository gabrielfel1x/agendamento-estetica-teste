'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const PACKAGE_ITEMS = [
  '6 aplicações de enzimas',
  '4 aplicações de BCAA',
  '3 Mantas Térmicas',
  '3 Drenomodeladoras',
];

export default function AssinaturaPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [step, setStep]             = useState<'confirm' | 'payment'>('confirm');
  const [payOption, setPayOption]   = useState<'parcelado' | 'avista'>('parcelado');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName]     = useState('');
  const [cardExp, setCardExp]       = useState('');
  const [cardCvv, setCardCvv]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!user) router.replace('/cadastro?ref=pacote');
    else if (user.role === 'cliente' && user.plan && user.planStatus === 'ativo') router.replace('/minha-conta');
  }, [user, router]);

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

    if (cardNumber.replace(/\s/g, '').length < 16) { setError('Número do cartão inválido.'); return; }
    if (cardExp.length < 5)  { setError('Data de validade inválida.'); return; }
    if (cardCvv.length < 3)  { setError('CVV inválido.'); return; }

    setLoading(true);
    setTimeout(() => {
      const today = new Date();
      const next  = new Date(today);
      next.setMonth(next.getMonth() + 1);

      updateUser({
        plan: 'pacote',
        planStatus: 'ativo',
        subscriptionDate: today.toISOString().split('T')[0],
        nextBillingDate: next.toISOString().split('T')[0],
        monthlyValue: payOption === 'avista' ? 'R$ 599,90 (à vista)' : '12x de R$ 55,99',
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
              <img src="/logo.svg" alt="Depill plus" className="sub-logo-img" />
              <span className="sub-logo-text">Depill plus</span>
            </Link>
            {step === 'payment' ? (
              <button className="sub-back-link" onClick={() => setStep('confirm')}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar ao pacote
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

      {/* Progress */}
      <div className="sub-progress-bar">
        <div className="container">
          <div className="sub-progress-inner">
            <div className={`sub-progress-step${step === 'confirm' || step === 'payment' ? ' done' : ''}`}>
              <span className="sub-progress-num">1</span>
              <span>Pacote</span>
            </div>
            <div className="sub-progress-line" />
            <div className={`sub-progress-step${step === 'payment' ? ' done' : ''}`}>
              <span className="sub-progress-num">2</span>
              <span>Pagamento</span>
            </div>
            <div className="sub-progress-line" />
            <div className="sub-progress-step">
              <span className="sub-progress-num">3</span>
              <span>Confirmação</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="sub-content">

          {/* ── Step 1: Confirm package ── */}
          {step === 'confirm' && (
            <div className="sub-pkg-wrap">
              <div className="sub-pkg-info">
                <p className="sub-pkg-label">Pacote especial</p>
                <h1 className="sub-title">
                  Emagrecimento &<br /><em>Hipertrofia</em>
                </h1>
                <p className="sub-subtitle">
                  Protocolo completo desenvolvido para resultados expressivos em
                  emagrecimento e definição muscular.
                </p>

                <ul className="sub-pkg-items">
                  {PACKAGE_ITEMS.map(item => (
                    <li key={item}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sub-pkg-price-card">
                <p className="sub-pkg-price-label">Escolha a forma de pagamento</p>

                <div className="sub-pay-options">
                  <button
                    className={`sub-pay-option${payOption === 'parcelado' ? ' active' : ''}`}
                    onClick={() => setPayOption('parcelado')}
                  >
                    <div className="sub-pay-option-main">
                      <span className="sub-pay-option-value">12x de R$ 55,99</span>
                      <span className="sub-pay-option-badge">No cartão</span>
                    </div>
                    <span className="sub-pay-option-total">Total: R$ 671,88</span>
                  </button>

                  <button
                    className={`sub-pay-option${payOption === 'avista' ? ' active' : ''}`}
                    onClick={() => setPayOption('avista')}
                  >
                    <div className="sub-pay-option-main">
                      <span className="sub-pay-option-value">R$ 599,90</span>
                      <span className="sub-pay-option-badge best">Melhor preço</span>
                    </div>
                    <span className="sub-pay-option-total">À vista · Economia de R$ 71,98</span>
                  </button>
                </div>

                <button
                  className="sub-plan-cta primary"
                  onClick={() => { setStep('payment'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Continuar para pagamento
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <p className="sub-secure-note">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  Pagamento seguro com criptografia
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 'payment' && (
            <div className="sub-payment-wrap">
              <div className="sub-payment-summary">
                <p className="sub-payment-summary-label">Resumo do pedido</p>
                <h3 className="sub-payment-summary-name">Pacote Emagrecimento e Hipertrofia</h3>
                <div className="sub-payment-summary-price">
                  <span className="sub-payment-summary-value">
                    {payOption === 'avista' ? 'R$ 599,90' : '12x de R$ 55,99'}
                  </span>
                </div>
                <ul className="sub-payment-summary-features">
                  {PACKAGE_ITEMS.map(item => (
                    <li key={item}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="sub-change-plan" onClick={() => setStep('confirm')}>
                  Alterar forma de pagamento
                </button>
              </div>

              <form className="sub-payment-form" onSubmit={handleSubmit}>
                <h2 className="sub-payment-title">Dados do cartão</h2>
                <p className="sub-payment-sub">
                  {payOption === 'avista'
                    ? 'Cobrança única de R$ 599,90.'
                    : 'Primeira parcela cobrada agora. 11 parcelas seguintes mensalmente.'}
                </p>

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
                      <><span className="login-spinner" /> Processando...</>
                    ) : payOption === 'avista'
                      ? 'Pagar R$ 599,90'
                      : 'Pagar 1ª parcela de R$ 55,99'
                    }
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
