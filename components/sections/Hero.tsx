export default function Hero() {
  return (
    <section id="hero">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80"
          alt="Depill plus"
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-grain" />

      <div className="container">
        <div className="hero-content">
          <p className="hero-label">Centro de Saúde e Estética &middot; Depill plus</p>
          <h1 className="hero-title">
            <span className="line"><span className="line-inner">Cuide de você</span></span>
            <span className="line"><span className="line-inner">com quem <em>entende</em></span></span>
            <span className="line"><span className="line-inner">do assunto.</span></span>
          </h1>
          <p className="hero-sub">
            Tratamentos faciais, corporais, depilação a laser e muito mais.
            Agende sua sessão e experimente o cuidado personalizado da Depill plus.
          </p>
          <div className="hero-actions">
            <a href="#services" className="btn-primary">
              <span>Ver serviços</span>
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
