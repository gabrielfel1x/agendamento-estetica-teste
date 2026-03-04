const testimonials = [
  {
    quote: 'A experiência foi completamente diferente de qualquer outra clínica que já visitei. Desde o agendamento online até o atendimento, tudo foi impecável.',
    name: 'Ana Paula Mendes',
    proc: 'Toxina Botulínica',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Agendei pelo site às 23h, escolhi o horário ideal, paguei com Pix e recebi a confirmação na hora. No dia seguinte já estava sendo atendida. Incrível!',
    name: 'Camila Ferreira',
    proc: 'Limpeza de Pele',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Os resultados do preenchimento foram exatamente o que eu queria — naturais e harmoniosos. A doutora é extremamente cuidadosa e o espaço é lindo.',
    name: 'Beatriz Oliveira',
    proc: 'Preenchimento Labial',
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
              <em>pacientes dizem.</em>
            </h2>
          </div>
          <p className="section-sub reveal d2">
            Histórias reais de transformação e cuidado com resultado.
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
