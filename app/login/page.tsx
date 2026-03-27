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
      if (user.role === 'cliente') router.replace('/minha-conta');
      else router.replace('/agenda');
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await login(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    }
  }

  return (
    <div className="login-layout">
      {/* Left — image side */}
      <div className="login-image-side">
        <img
          src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80"
          alt="Depill plus"
          className="login-bg-img"
        />
        <div className="login-image-overlay" />
        <div className="login-image-content">
          <div className="login-brand">
            <img src="/logo.svg" alt="Depill plus" className="login-brand-img" />
            <span className="login-brand-name">Depill plus</span>
          </div>
          <p className="login-image-label">Centro de Saúde e Estética</p>
          <h2 className="login-image-title">
            Cuide de você<br />com quem <em>entende</em><br />do assunto.
          </h2>
          <p className="login-image-sub">
            Agende suas sessões, acompanhe seu histórico e gerencie seu pacote
            diretamente pelo painel da Depill plus.
          </p>
        </div>
      </div>

      {/* Right — form side */}
      <div className="login-form-side">
        <div className="login-form-inner">
          <div className="login-form-logo">
            <img src="/logo.svg" alt="Depill plus" className="login-form-logo-img" />
            <span className="login-form-logo-text">Depill plus</span>
          </div>

          <div className="login-form-header">
            <h1 className="login-form-title">Bem-vinda de volta</h1>
            <p className="login-form-sub">Acesse sua conta com suas credenciais.</p>
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
              {loading ? <span className="login-spinner" /> : 'Entrar'}
            </button>
          </form>

          <p className="login-register-link">
            Ainda não tem conta?{' '}
            <Link href="/cadastro">Criar conta grátis</Link>
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
