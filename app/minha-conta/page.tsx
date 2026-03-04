'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPlanById } from '@/lib/subscription-data';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

export default function MinhaContaPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'cliente') {
      router.replace('/agenda');
    } else if (!user.plan) {
      router.replace('/assinatura');
    }
  }, [user, router]);

  function handleCancel() {
    updateUser({ planStatus: 'cancelado' });
    setShowCancel(false);
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  if (!user || user.role !== 'cliente' || !user.plan) return null;

  const plan = getPlanById(user.plan);
  const statusLabel = user.planStatus === 'ativo' ? 'Ativa' : user.planStatus === 'pendente' ? 'Pendente' : 'Cancelada';
  const statusClass = user.planStatus || 'ativo';

  return (
    <div className="cd-layout">
      {/* Header */}
      <header className="cd-header">
        <div className="container">
          <div className="cd-header-inner">
            <Link href="/" className="cd-logo">
              <span className="cd-logo-text">Lumière</span>
              <span className="logo-dot" />
            </Link>
            <div className="cd-header-right">
              <span className="cd-header-user">
                {user.name}
              </span>
              <button className="cd-header-logout" onClick={handleLogout}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="cd-content">
          <div className="cd-content-header">
            <div>
              <h1 className="cd-title">Minha Conta</h1>
              <p className="cd-subtitle">Gerencie sua assinatura e acompanhe seus benefícios.</p>
            </div>
          </div>

          {/* Metric cards */}
          <div className="cd-metrics">
            <div className="cd-metric-card">
              <p className="cd-metric-label">Plano atual</p>
              <p className="cd-metric-value">{plan?.name || user.plan}</p>
              <span className={`cd-status-badge ${statusClass}`}>{statusLabel}</span>
            </div>
            <div className="cd-metric-card">
              <p className="cd-metric-label">Mensalidade</p>
              <p className="cd-metric-value accent">{user.monthlyValue || plan?.price}</p>
              <p className="cd-metric-sub">Cobrança recorrente</p>
            </div>
            <div className="cd-metric-card">
              <p className="cd-metric-label">Próxima cobrança</p>
              <p className="cd-metric-value-sm">{formatDate(user.nextBillingDate)}</p>
              <p className="cd-metric-sub">No cartão cadastrado</p>
            </div>
            <div className="cd-metric-card">
              <p className="cd-metric-label">Membro desde</p>
              <p className="cd-metric-value-sm">{formatDate(user.subscriptionDate)}</p>
              <p className="cd-metric-sub">Assinatura contínua</p>
            </div>
          </div>

          {/* Plan details */}
          <div className="cd-plan-card">
            <div className="cd-plan-header">
              <div>
                <h2 className="cd-plan-name">Plano {plan?.name}</h2>
                <p className="cd-plan-desc">{plan?.desc}</p>
              </div>
              <span className={`cd-status-badge lg ${statusClass}`}>{statusLabel}</span>
            </div>

            <div className="cd-plan-features">
              {plan?.features.map(f => (
                <div key={f} className="cd-plan-feature">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="cd-actions">
            <a
              href="https://wa.me/5511999999999?text=Olá! Sou assinante do plano Lumière e gostaria de agendar um procedimento."
              target="_blank"
              rel="noopener noreferrer"
              className="cd-wa-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.963 7.963 0 01-4.105-1.137l-.295-.176-2.871.853.853-2.871-.176-.295A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
              </svg>
              Falar com a clínica
            </a>

            {user.planStatus === 'ativo' && (
              <button className="cd-cancel-btn" onClick={() => setShowCancel(true)}>
                Solicitar cancelamento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="cd-modal-overlay" onClick={() => setShowCancel(false)}>
          <div className="cd-modal" onClick={e => e.stopPropagation()}>
            <div className="cd-modal-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="cd-modal-title">Cancelar assinatura?</h3>
            <p className="cd-modal-text">
              Você perderá acesso a todos os benefícios do plano {plan?.name} ao final do período atual.
              Tem certeza que deseja cancelar?
            </p>
            <div className="cd-modal-actions">
              <button className="cd-modal-keep" onClick={() => setShowCancel(false)}>
                Manter plano
              </button>
              <button className="cd-modal-confirm" onClick={handleCancel}>
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
