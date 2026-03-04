'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'cliente') router.replace(user.plan ? '/minha-conta' : '/assinatura');
      else router.replace('/agenda');
    }
  }, [user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        // Redirect happens via the useEffect watching user
      } else {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="login-layout">
      {/* Left — image side */}
      <div className="login-image-side">
        <img
          src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80"
          alt="Clínica Lumière"
          className="login-bg-img"
        />
        <div className="login-image-overlay" />
        <div className="login-image-content">
          <div className="login-brand">
            <span className="login-brand-name">Lumière</span>
            <span className="login-brand-dot" />
          </div>
          <p className="login-image-label">Sistema de Gestão Interna</p>
          <h2 className="login-image-title">
            Gerencie sua<br /><em>clínica</em> com<br />elegância.
          </h2>
          <p className="login-image-sub">
            Agenda inteligente, gestão de clientes e relatórios financeiros em uma plataforma refinada.
          </p>
        </div>
      </div>

      {/* Right — form side */}
      <div className="login-form-side">
        <div className="login-form-inner">
          <div className="login-form-logo">
            <span className="login-form-logo-text">Lumière</span>
            <span className="login-form-logo-dot" />
          </div>

          <div className="login-form-header">
            <h1 className="login-form-title">Bem-vinda de volta</h1>
            <p className="login-form-sub">Acesse o sistema com suas credenciais.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label htmlFor="email" className="login-label">E-mail</label>
              <span className="login-line" />
            </div>

            <div className="login-field">
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder=" "
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <label htmlFor="password" className="login-label">Senha</label>
              <span className="login-line" />
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
              className={`login-btn${loading ? ' loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : 'Entrar'}
            </button>
          </form>

          <div className="login-hints">
            <p className="login-hint-title">Credenciais de demonstração</p>
            <div className="login-hint-row" onClick={() => { setEmail('admin@lumiere.com'); setPassword('admin123'); }}>
              <span className="login-hint-badge admin">Admin</span>
              <span>admin@lumiere.com · admin123</span>
            </div>
            <div className="login-hint-row" onClick={() => { setEmail('funcionaria@lumiere.com'); setPassword('123456'); }}>
              <span className="login-hint-badge func">Funcionária</span>
              <span>funcionaria@lumiere.com · 123456</span>
            </div>
            <div className="login-hint-row" onClick={() => { setEmail('ana@lumiere.com'); setPassword('cliente1'); }}>
              <span className="login-hint-badge cliente">Cliente</span>
              <span>ana@lumiere.com · cliente1</span>
            </div>
          </div>

          <p className="login-register-link">
            Ainda não tem conta?{' '}
            <Link href="/cadastro">Criar conta</Link>
          </p>

          <Link href="/" className="login-back">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
