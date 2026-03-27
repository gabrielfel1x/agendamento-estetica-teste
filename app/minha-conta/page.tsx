'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import AgendarSessaoModal from '@/components/system/AgendarSessaoModal';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

const PACKAGE_ITEMS = [
  '6 aplicações de enzimas',
  '4 aplicações de BCAA',
  '3 Mantas Térmicas',
  '3 Drenomodeladoras',
];

export default function MinhaContaPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [showCancel, setShowCancel]       = useState(false);
  const [showAgenda, setShowAgenda]       = useState(false);
  const [agendaSaved, setAgendaSaved]     = useState(false);

  useEffect(() => {
    if (!user) router.replace('/login');
    else if (user.role !== 'cliente') router.replace('/agenda');
  }, [user, router]);

  function handleCancel() {
    updateUser({ planStatus: 'cancelado' });
    setShowCancel(false);
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  function handleAgendaSaved() {
    setShowAgenda(false);
    setAgendaSaved(true);
    setTimeout(() => setAgendaSaved(false), 4000);
  }

  if (!user || user.role !== 'cliente') return null;

  const hasPacote  = !!user.plan;
  const statusLabel = user.planStatus === 'ativo' ? 'Ativo' : user.planStatus === 'pendente' ? 'Pendente' : 'Cancelado';
  const statusClass = user.planStatus || 'ativo';

  return (
    <div className="cd-layout">
      {/* Header */}
      <header className="cd-header">
        <div className="container">
          <div className="cd-header-inner">
            <Link href="/" className="cd-logo">
              <img src="/logo.svg" alt="Depill plus" className="cd-logo-img" />
              <span className="cd-logo-text">Depill plus</span>
            </Link>
            <div className="cd-header-right">
              <span className="cd-header-user">{user.name}</span>
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

          {/* ── Title ── */}
          <div className="cd-content-header">
            <div>
              <h1 className="cd-title">Minha Conta</h1>
              <p className="cd-subtitle">
                {hasPacote
                  ? 'Acompanhe seu pacote e agende suas sessões.'
                  : 'Agende seus tratamentos ou contrate nosso pacote especial.'}
              </p>
            </div>

            {/* Agendar button — always visible */}
            <button className="cd-agendar-btn" onClick={() => setShowAgenda(true)}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Nova sessão
            </button>
          </div>

          {/* ── Success toast ── */}
          {agendaSaved && (
            <div className="cd-toast">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Agendamento criado com sucesso!
            </div>
          )}

          {/* ── WITH PACKAGE ── */}
          {hasPacote && (
            <>
              <div className="cd-metrics">
                <div className="cd-metric-card">
                  <p className="cd-metric-label">Pacote</p>
                  <p className="cd-metric-value">Emagrecimento</p>
                  <span className={`cd-status-badge ${statusClass}`}>{statusLabel}</span>
                </div>
                <div className="cd-metric-card">
                  <p className="cd-metric-label">Valor pago</p>
                  <p className="cd-metric-value accent">{user.monthlyValue || 'R$ 599,90'}</p>
                  <p className="cd-metric-sub">Pacote completo</p>
                </div>
                <div className="cd-metric-card">
                  <p className="cd-metric-label">Próxima parcela</p>
                  <p className="cd-metric-value-sm">{formatDate(user.nextBillingDate)}</p>
                  <p className="cd-metric-sub">No cartão cadastrado</p>
                </div>
                <div className="cd-metric-card">
                  <p className="cd-metric-label">Cliente desde</p>
                  <p className="cd-metric-value-sm">{formatDate(user.subscriptionDate)}</p>
                  <p className="cd-metric-sub">Depill plus</p>
                </div>
              </div>

              <div className="cd-plan-card">
                <div className="cd-plan-header">
                  <div>
                    <h2 className="cd-plan-name">Pacote Emagrecimento e Hipertrofia</h2>
                    <p className="cd-plan-desc">Protocolo completo para emagrecimento e definição muscular.</p>
                  </div>
                  <span className={`cd-status-badge lg ${statusClass}`}>{statusLabel}</span>
                </div>
                <div className="cd-plan-features">
                  {PACKAGE_ITEMS.map(f => (
                    <div key={f} className="cd-plan-feature">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── WITHOUT PACKAGE ── */}
          {!hasPacote && (
            <div className="cd-no-pkg">
              <div className="cd-no-pkg-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
              </div>
              <h3 className="cd-no-pkg-title">Nenhum pacote ativo</h3>
              <p className="cd-no-pkg-text">
                Você pode agendar sessões avulsas ou contratar o Pacote Emagrecimento e Hipertrofia
                com condições especiais.
              </p>
              <Link href="/assinatura" className="cd-pkg-cta">
                Conhecer o pacote
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="cd-actions">
            <a
              href="https://www.instagram.com/depillplusestetica/"
              target="_blank"
              rel="noopener noreferrer"
              className="cd-wa-btn"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Falar com a clínica
            </a>

            {hasPacote && user.planStatus === 'ativo' && (
              <button className="cd-cancel-btn" onClick={() => setShowCancel(true)}>
                Solicitar cancelamento
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Scheduling modal ── */}
      <AgendarSessaoModal
        isOpen={showAgenda}
        onClose={() => setShowAgenda(false)}
        onSaved={handleAgendaSaved}
      />

      {/* ── Cancel confirmation modal ── */}
      {showCancel && (
        <div className="cd-modal-overlay" onClick={() => setShowCancel(false)}>
          <div className="cd-modal" onClick={e => e.stopPropagation()}>
            <div className="cd-modal-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="cd-modal-title">Cancelar pacote?</h3>
            <p className="cd-modal-text">
              Você perderá acesso ao Pacote Emagrecimento e Hipertrofia.
              Tem certeza que deseja cancelar?
            </p>
            <div className="cd-modal-actions">
              <button className="cd-modal-keep" onClick={() => setShowCancel(false)}>
                Manter pacote
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
