'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AcessoPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'cliente') {
        setError('Acesso restrito. Esta área é exclusiva para funcionárias.');
      } else {
        router.replace('/agenda');
      }
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
    <div className="acesso-layout">
      <div className="acesso-card">
        <div className="acesso-logo">
          <img src="/logo.svg" alt="Depill plus" className="acesso-logo-img" />
          <span className="acesso-logo-text">Depill plus</span>
        </div>

        <div className="acesso-header">
          <h1 className="acesso-title">Acesso interno</h1>
          <p className="acesso-sub">Área restrita — funcionárias e administração.</p>
        </div>

        <form className="acesso-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <input
              id="acesso-email"
              type="email"
              className="login-input"
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label htmlFor="acesso-email" className="login-label">E-mail</label>
            <span className="login-line" />
          </div>

          <div className="login-field">
            <input
              id="acesso-password"
              type="password"
              className="login-input"
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label htmlFor="acesso-password" className="login-label">Senha</label>
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
      </div>
    </div>
  );
}
