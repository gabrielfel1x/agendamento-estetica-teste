export default function Hero() {
  return (
    <section id="hero">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80"
          alt="Clínica Lumière"
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-grain" />

      <div className="container">
        <div className="hero-content">
          <p className="hero-label">Clínica Estética Premium &middot; Planos Mensais</p>
          <h1 className="hero-title">
            <span className="line"><span className="line-inner">Sua beleza com</span></span>
            <span className="line"><span className="line-inner">cuidado <em>contínuo</em> e</span></span>
            <span className="line"><span className="line-inner">exclusivo.</span></span>
          </h1>
          <p className="hero-sub">
            Assine um plano mensal e tenha acesso a procedimentos estéticos premium
            com condições especiais, agendamento prioritário e acompanhamento personalizado.
          </p>
          <div className="hero-actions">
            <a href="#plans" className="btn-primary">
              <span>Conhecer Planos</span>
            </a>
            <a href="#how" className="btn-outline">
              Como funciona
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
