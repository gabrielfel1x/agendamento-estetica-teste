'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import AgendarSessaoModal from '@/components/system/AgendarSessaoModal';
import { getClientAppointments, AdminAppointment } from '@/lib/admin-data';
import { createClient } from '@/lib/supabase/client';
import { getPlans, type PlanData } from '@/lib/plans-data';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

const MONTHS_APT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const WEEKDAYS_APT = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

function fmtAptDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${parseInt(day)} ${MONTHS_APT[parseInt(m)-1]}. ${y}`;
}

function fmtAptDateFull(d: string) {
  const dt = new Date(d + 'T12:00:00');
  return `${WEEKDAYS_APT[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()]} de ${dt.getFullYear()}`;
}

function isUpcoming(d: string) {
  const today = new Date().toISOString().slice(0, 10);
  return d >= today;
}

export default function MinhaContaPage() {
  const { user, loaded, updateUser, logout } = useAuth();
  const router = useRouter();
  const [planData, setPlanData]           = useState<PlanData | null>(null);
  const [showCancel, setShowCancel]       = useState(false);
  const [showAgenda, setShowAgenda]       = useState(false);
  const [agendaSaved, setAgendaSaved]     = useState(false);
  const [apts, setApts]                   = useState<AdminAppointment[]>([]);
  const [loadingApts, setLoadingApts]     = useState(false);
  const [selectedApt, setSelectedApt]     = useState<AdminAppointment | null>(null);

  // Só redireciona após auth carregar — evita redirect no reload
  useEffect(() => {
    if (loaded && !user) router.replace('/login');
  }, [loaded, user, router]);

  // Carrega dados do plano do Supabase
  useEffect(() => {
    if (!user?.plan) return;
    getPlans(createClient()).then(plans => {
      const match = plans.find(p => p.slug === user.plan) ?? plans.find(p => p.active) ?? null;
      setPlanData(match);
    });
  }, [user?.plan]);

  const [aptsKey, setAptsKey] = useState(0);
  const reloadApts = () => setAptsKey(k => k + 1);

  // Carrega agendamentos do cliente logado
  useEffect(() => {
    if (!user) return;
    setLoadingApts(true);
    getClientAppointments(user.id).then(data => {
      setApts(data);
      setLoadingApts(false);
    });
  }, [user?.id, aptsKey]);

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
    reloadApts();
    setTimeout(() => setAgendaSaved(false), 4000);
  }

  // Separa próximos vs passados (hooks devem rodar antes de qualquer return)
  const upcoming = useMemo(() =>
    apts
      .filter(a => isUpcoming(a.date) && a.status !== 'cancelado')
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [apts]
  );
  const past = useMemo(() =>
    apts
      .filter(a => !isUpcoming(a.date) || a.status === 'cancelado')
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [apts]
  );

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--ivory)' }}>
        <span className="login-spinner" />
      </div>
    );
  }

  const hasPacote   = !!user.plan;
  const statusLabel = user.planStatus === 'ativo' ? 'Ativo' : user.planStatus === 'pendente' ? 'Pendente' : 'Cancelado';
  const statusClass = user.planStatus || 'ativo';
  const planName    = planData?.name ?? 'Emagrecimento & Hipertrofia';
  const planFeatures = planData?.features ?? [];

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
              Solicitação enviada! Aguardando aprovação da clínica.
            </div>
          )}

          {/* ── WITH PACKAGE ── */}
          {hasPacote && (
            <>
              <div className="cd-metrics">
                <div className="cd-metric-card">
                  <p className="cd-metric-label">Pacote</p>
                  <p className="cd-metric-value">{planData ? planName.split('&')[0].trim() : '—'}</p>
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
                    <h2 className="cd-plan-name">{planName}</h2>
                    {planData?.description && <p className="cd-plan-desc">{planData.description}</p>}
                  </div>
                  <span className={`cd-status-badge lg ${statusClass}`}>{statusLabel}</span>
                </div>
                <div className="cd-plan-features">
                  {planFeatures.map(f => (
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

          {/* ── Meus agendamentos ── */}
          <section className="cd-apt-section">
            <div className="cd-apt-header">
              <div>
                <p className="cd-apt-label">Seus tratamentos</p>
                <h2 className="cd-apt-title">Meus agendamentos</h2>
              </div>
              <span className="cd-apt-count">
                {loadingApts ? '...' : `${apts.length} ${apts.length === 1 ? 'agendamento' : 'agendamentos'}`}
              </span>
            </div>

            {loadingApts ? (
              <div className="cd-apt-loading">
                <span className="login-spinner" />
              </div>
            ) : apts.length === 0 ? (
              <div className="cd-apt-empty">
                <div className="cd-apt-empty-icon">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p className="cd-apt-empty-title">Nenhum agendamento</p>
                <p className="cd-apt-empty-text">
                  Agende sua primeira sessão clicando em &ldquo;Nova sessão&rdquo; acima.
                </p>
              </div>
            ) : (
              <>
                {/* ── Próximos ── */}
                {upcoming.length > 0 && (
                  <div className="cd-apt-group">
                    <p className="cd-apt-group-label">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Próximos
                    </p>
                    <div className="cd-apt-grid">
                      {upcoming.map(a => (
                        <button key={a.id} className="cd-apt-card upcoming" onClick={() => setSelectedApt(a)}>
                          <div className="cd-apt-card-top">
                            <span className="cd-apt-card-date">{fmtAptDate(a.date)}</span>
                            <span className={`cd-apt-badge ${a.status}`}>{a.status}</span>
                          </div>
                          <p className="cd-apt-card-proc">{a.procedure}</p>
                          <div className="cd-apt-card-bottom">
                            <span className="cd-apt-card-time">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {a.time}
                            </span>
                            <span className="cd-apt-card-price">{a.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Histórico ── */}
                {past.length > 0 && (
                  <div className="cd-apt-group">
                    <p className="cd-apt-group-label">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>
                      </svg>
                      Histórico
                    </p>
                    <div className="cd-apt-grid">
                      {past.map(a => (
                        <button key={a.id} className="cd-apt-card past" onClick={() => setSelectedApt(a)}>
                          <div className="cd-apt-card-top">
                            <span className="cd-apt-card-date">{fmtAptDate(a.date)}</span>
                            <span className={`cd-apt-badge ${a.status}`}>{a.status}</span>
                          </div>
                          <p className="cd-apt-card-proc">{a.procedure}</p>
                          <div className="cd-apt-card-bottom">
                            <span className="cd-apt-card-time">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {a.time}
                            </span>
                            <span className="cd-apt-card-price">{a.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

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

      {/* ── Appointment detail modal ── */}
      {selectedApt && (
        <div className="cd-modal-overlay" onClick={() => setSelectedApt(null)}>
          <div className="cd-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="cd-detail-close" onClick={() => setSelectedApt(null)} aria-label="Fechar">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="cd-detail-header">
              <span className={`cd-apt-badge lg ${selectedApt.status}`}>{selectedApt.status}</span>
              <h3 className="cd-detail-proc">{selectedApt.procedure}</h3>
              <p className="cd-detail-date-full">{fmtAptDateFull(selectedApt.date)}</p>
            </div>

            <div className="cd-detail-grid">
              <div className="cd-detail-item">
                <span className="cd-detail-item-label">Horário</span>
                <span className="cd-detail-item-value">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {selectedApt.time}
                </span>
              </div>
              <div className="cd-detail-item">
                <span className="cd-detail-item-label">Valor</span>
                <span className="cd-detail-item-value price">{selectedApt.price}</span>
              </div>
              <div className="cd-detail-item">
                <span className="cd-detail-item-label">Data</span>
                <span className="cd-detail-item-value">{fmtAptDate(selectedApt.date)}</span>
              </div>
              <div className="cd-detail-item">
                <span className="cd-detail-item-label">Status</span>
                <span className="cd-detail-item-value">{selectedApt.status === 'confirmado' ? 'Confirmado' : selectedApt.status === 'pendente' ? 'Pendente' : 'Cancelado'}</span>
              </div>
            </div>

            <div className="cd-detail-actions">
              <a
                href="https://www.instagram.com/depillplusestetica/"
                target="_blank"
                rel="noopener noreferrer"
                className="cd-detail-contact"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                Falar com a clínica
              </a>
              <button className="cd-detail-close-btn" onClick={() => setSelectedApt(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
