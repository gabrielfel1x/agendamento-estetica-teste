const benefits = [
  {
    title: 'Agendamento 24h',
    text: 'Marque sua sessão a qualquer hora do dia ou da noite, sem filas e sem ligações. Tudo online, em segundos.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: 'Profissionais Certificados',
    text: 'Equipe multidisciplinar com formação acadêmica de excelência e certificações nacionais e internacionais.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Confirmação Instantânea',
    text: 'Receba confirmação imediata por e-mail e WhatsApp assim que seu agendamento for concluído.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'Pagamento Seguro',
    text: 'Cartão de crédito, débito ou Pix com criptografia ponta a ponta. Seus dados sempre protegidos.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: 'Lembretes Automáticos',
    text: 'Notificações inteligentes 48h e 2h antes do seu horário para que você nunca esqueça sua sessão.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    title: 'Reagendamento Fácil',
    text: 'Precisou mudar? Reagende com até 12h de antecedência diretamente pelo link enviado na confirmação.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section id="benefits">
      <div className="container">
        <div className="benefits-header reveal">
          <p className="section-label">Por que nos escolher</p>
          <h2 className="section-title">
            Uma experiência
            <br />
            <em>além do tratamento.</em>
          </h2>
          <p className="section-sub">
            Cada detalhe foi pensado para que você se sinta cuidada e segura,
            do agendamento ao pós-procedimento.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((b, i) => (
            <div key={b.title} className={`benefit-card reveal d${i + 1}`}>
              <div className="benefit-icon">{b.icon}</div>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-text">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
