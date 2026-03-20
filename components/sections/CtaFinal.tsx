export default function CtaFinal() {
  return (
    <section id="cta-final">
      <div className="cta-bg">
        <img
          src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1920&q=80"
          alt="Depill plus"
        />
      </div>
      <div className="cta-overlay" />

      <div className="container">
        <div className="cta-content">
          <p className="section-label cta-label reveal">Depill plus</p>
          <h2 className="cta-title reveal d1">
            O cuidado que você merece
            <br />
            está <em>mais perto</em> do que pensa.
          </h2>
          <p className="cta-sub reveal d2">
            Explore nosso catálogo de tratamentos, agende sua sessão e sinta
            a diferença de ser atendida por quem realmente entende de você.
          </p>
          <div className="cta-actions reveal d3">
            <a href="#services" className="btn-cta">
              <span>Ver todos os serviços</span>
            </a>
            <a
              href="https://www.instagram.com/depillplusestetica/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-insta"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              @depillplusestetica
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
