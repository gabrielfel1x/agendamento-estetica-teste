import OpenModalButton from '@/components/OpenModalButton';

export default function CtaFinal() {
  return (
    <section id="cta-final">
      <div className="cta-bg">
        <img
          src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1920&q=80"
          alt="Agende agora"
        />
      </div>
      <div className="cta-overlay" />

      <div className="container">
        <div className="cta-content">
          <p className="section-label cta-label reveal">Comece agora</p>
          <h2 className="cta-title reveal d1">
            Você merece
            <br />
            <em>se sentir</em> incrível.
          </h2>
          <p className="cta-sub reveal d2">
            Reserve sua sessão hoje. Confirmação imediata, atendimento exclusivo e
            resultados que falam por si.
          </p>
          <OpenModalButton className="btn-cta reveal d3">
            <span>Agendar Agora</span>
          </OpenModalButton>
        </div>
      </div>
    </section>
  );
}
