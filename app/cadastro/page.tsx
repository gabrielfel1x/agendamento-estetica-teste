'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function CadastroPage() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'cliente') {
        router.replace(user.plan ? '/minha-conta' : '/assinatura');
      } else {
        router.replace('/agenda');
      }
    }
  }, [user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPwd) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const ok = register(name, email, password);
      if (ok) {
        router.push('/assinatura');
      } else {
        setError('Este e-mail já está em uso.');
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="login-layout">
      {/* Left — image side */}
      <div className="login-image-side">
        <img
          src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=80"
          alt="Clínica Lumière"
          className="login-bg-img"
        />
        <div className="login-image-overlay" />
        <div className="login-image-content">
          <div className="login-brand">
            <span className="login-brand-name">Lumière</span>
            <span className="login-brand-dot" />
          </div>
          <p className="login-image-label">Assinatura mensal</p>
          <h2 className="login-image-title">
            Sua jornada de<br /><em>cuidados</em><br />começa aqui.
          </h2>
          <p className="login-image-sub">
            Crie sua conta e escolha o plano ideal para transformar sua rotina de estética com benefícios exclusivos.
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
            <h1 className="login-form-title">Criar conta</h1>
            <p className="login-form-sub">Preencha seus dados para começar.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <input
                id="name"
                type="text"
                className="login-input"
                placeholder=" "
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
              <label htmlFor="name" className="login-label">Nome completo</label>
              <span className="login-line" />
            </div>

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
                autoComplete="new-password"
              />
              <label htmlFor="password" className="login-label">Senha</label>
              <span className="login-line" />
            </div>

            <div className="login-field">
              <input
                id="confirm-password"
                type="password"
                className="login-input"
                placeholder=" "
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                required
                autoComplete="new-password"
              />
              <label htmlFor="confirm-password" className="login-label">Confirmar senha</label>
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
              {loading ? <span className="login-spinner" /> : 'Criar conta'}
            </button>
          </form>

          <p className="login-register-link">
            Já tem conta?{' '}
            <Link href="/login">Entrar</Link>
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
