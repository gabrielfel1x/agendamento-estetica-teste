const benefits = [
  {
    title: 'Profissionais Certificados',
    text: 'Equipe especializada com formação técnica e protocolos atualizados para garantir segurança e resultados reais.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Tratamentos Faciais',
    text: 'Limpeza de pele, revitalização, rejuvenescimento e drenagem facial com técnicas que respeitam seu biotipo.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="5" /><path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8" />
      </svg>
    ),
  },
  {
    title: 'Cuidados Corporais',
    text: 'Drenagem linfática, modeladora, detox, ventosa, ozônioterapia e pós-operatório. Seu corpo em equilíbrio.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Depilação a Laser',
    text: 'Perna completa, axila, barba, contorno e muito mais. Tecnologia laser segura para todos os fototipos.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Pacote Especial',
    text: '6 enzimas + 4 BCAA + 3 Mantas Térmicas + 3 Drenomodeladoras. Protocolo completo de emagrecimento e hipertrofia.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
  },
  {
    title: 'Agendamento Online',
    text: 'Agende sua sessão pelo aplicativo com facilidade. Escolha a data, horário e confirme em poucos passos.',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section id="benefits">
      <div className="container">
        <div className="benefits-header reveal">
          <p className="section-label">Por que a Depill plus</p>
          <h2 className="section-title">
            Cuidado completo,
            <br />
            <em>de cabeça a pés.</em>
          </h2>
          <p className="section-sub">
            Uma clínica com estrutura completa para você cuidar da saúde e estética
            com conforto, segurança e resultados que aparecem.
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
