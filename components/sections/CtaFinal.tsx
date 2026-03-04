import Link from 'next/link';

export default function CtaFinal() {
  return (
    <section id="cta-final">
      <div className="cta-bg">
        <img
          src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1920&q=80"
          alt="Clínica Lumière"
        />
      </div>
      <div className="cta-overlay" />

      <div className="container">
        <div className="cta-content">
          <p className="section-label cta-label reveal">Comece hoje</p>
          <h2 className="cta-title reveal d1">
            Sua rotina de cuidados
            <br />
            merece ser <em>extraordinária.</em>
          </h2>
          <p className="cta-sub reveal d2">
            Assine um dos nossos planos e tenha acesso a procedimentos exclusivos
            com condições especiais todo mês. Sem fidelidade, cancele quando quiser.
          </p>
          <a href="#plans" className="btn-cta reveal d3">
            <span>Conhecer Planos</span>
          </a>
        </div>
      </div>
    </section>
  );
}
