const benefits = [
  {
    title: 'Economia Mensal',
    text: 'Pague menos que o valor avulso dos procedimentos. Quanto mais usa, mais economiza com seu plano.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: 'Agendamento Prioritário',
    text: 'Assinantes têm prioridade na escolha de horários. Reserve os melhores dias e horários antes de todos.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: 'Profissionais Certificados',
    text: 'Equipe multidisciplinar com formação de excelência e certificações nacionais e internacionais.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Sem Fidelidade',
    text: 'Cancele quando quiser, sem multa e sem burocracia. Sua assinatura, suas regras.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'Cobrança Automática',
    text: 'Pagamento recorrente no cartão de crédito. Sem preocupação, sem atraso, renovação automática.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Painel do Assinante',
    text: 'Acompanhe seu plano, histórico e próxima cobrança pelo painel exclusivo. Tudo na palma da mão.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section id="benefits">
      <div className="container">
        <div className="benefits-header reveal">
          <p className="section-label">Vantagens do plano</p>
          <h2 className="section-title">
            Muito mais que
            <br />
            <em>procedimentos avulsos.</em>
          </h2>
          <p className="section-sub">
            Assinar a Lumière é ter acesso a uma experiência completa de cuidado,
            com economia real e benefícios exclusivos para assinantes.
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
