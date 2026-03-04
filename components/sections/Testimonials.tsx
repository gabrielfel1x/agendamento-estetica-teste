const testimonials = [
  {
    quote: 'Assino o plano Premium há 6 meses e já economizei mais de R$2.000 em procedimentos. A prioridade no agendamento é um diferencial enorme.',
    name: 'Ana Paula Mendes',
    proc: 'Plano Premium',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Criei a conta, escolhi o plano e em 5 minutos já estava com tudo ativo. No mesmo dia agendei minha primeira sessão. Prático demais!',
    name: 'Camila Ferreira',
    proc: 'Plano Essencial',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'O painel do assinante é muito bem feito — consigo ver meu plano, as cobranças e até falar com a clínica pelo WhatsApp. Tudo integrado.',
    name: 'Beatriz Oliveira',
    proc: 'Plano VIP',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
];

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function Testimonials() {
  return (
    <section id="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <div className="reveal">
            <p className="section-label">Depoimentos</p>
            <h2 className="section-title">
              O que nossas
              <br />
              <em>assinantes dizem.</em>
            </h2>
          </div>
          <p className="section-sub reveal d2">
            Histórias reais de quem assinou e transformou sua rotina de cuidados.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`t-card reveal d${i}`}>
              <div className="t-badge"><CheckIcon /></div>
              <div className="t-quote">&ldquo;</div>
              <p className="t-text">{t.quote}</p>
              <div className="t-author">
                <div className="t-avatar">
                  <img src={t.avatar} alt={t.name} />
                </div>
                <div>
                  <p className="t-name">{t.name}</p>
                  <p className="t-proc">{t.proc}</p>
                  <div className="t-stars">★★★★★</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
