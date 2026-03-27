'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

function CadastroForm() {
  const { user, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref'); // 'pacote' = vem do fluxo de contratação

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'cliente') {
        router.replace(user.plan ? '/minha-conta' : (ref === 'pacote' ? '/assinatura' : '/minha-conta'));
      } else {
        router.replace('/agenda');
      }
    }
  }, [user, router, ref]);

  async function handleSubmit(e: React.FormEvent) {
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
    const { error } = await register(name, email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push(ref === 'pacote' ? '/assinatura' : '/minha-conta');
    }
  }

  return (
    <div className="login-layout">
      {/* Left — image side */}
      <div className="login-image-side">
        <img
          src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=80"
          alt="Depill plus"
          className="login-bg-img"
        />
        <div className="login-image-overlay" />
        <div className="login-image-content">
          <div className="login-brand">
            <img src="/logo.svg" alt="Depill plus" className="login-brand-img" />
            <span className="login-brand-name">Depill plus</span>
          </div>
          <p className="login-image-label">
            {ref === 'pacote' ? 'Pacote Emagrecimento e Hipertrofia' : 'Centro de Saúde e Estética'}
          </p>
          <h2 className="login-image-title">
            {ref === 'pacote'
              ? <>Sua jornada de<br /><em>transformação</em><br />começa aqui.</>
              : <>Agende sua<br />primeira <em>sessão</em><br />hoje.</>
            }
          </h2>
          <p className="login-image-sub">
            {ref === 'pacote'
              ? 'Crie sua conta e contrate o pacote completo de emagrecimento e hipertrofia com condições exclusivas.'
              : 'Crie sua conta gratuitamente e comece a agendar seus tratamentos na Depill plus.'
            }
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
            <Link href={ref === 'pacote' ? `/login?ref=pacote` : '/login'}>Entrar</Link>
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

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroForm />
    </Suspense>
  );
}
