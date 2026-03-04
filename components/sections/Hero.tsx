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
          <p className="hero-label">Clínica Estética Premium &middot; Desde 2015</p>
          <h1 className="hero-title">
            <span className="line"><span className="line-inner">Excelência em</span></span>
            <span className="line"><span className="line-inner">estética <em>facial</em> e</span></span>
            <span className="line"><span className="line-inner">corporal.</span></span>
          </h1>
          <p className="hero-sub">
            Procedimentos exclusivos com profissionais certificados. Resultados que transformam
            com segurança, técnica e cuidado verdadeiramente personalizado.
          </p>
          <div className="hero-actions">
            <a href="#procedures" className="btn-primary">
              <span>Ver Procedimentos</span>
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
