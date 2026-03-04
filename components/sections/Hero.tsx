import OpenModalButton from '@/components/OpenModalButton';

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
            <span className="line"><span className="line-inner">Seu agendamento</span></span>
            <span className="line"><span className="line-inner"><em>estético</em> em</span></span>
            <span className="line"><span className="line-inner">um clique.</span></span>
          </h1>
          <p className="hero-sub">
            Procedimentos exclusivos com profissionais certificados. Agende online em
            minutos, com confirmação imediata e atendimento verdadeiramente personalizado.
          </p>
          <div className="hero-actions">
            <OpenModalButton className="btn-primary">
              <span>Agendar Agora</span>
            </OpenModalButton>
            <a href="#procedures" className="btn-outline">
              Ver Procedimentos
            </a>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll-label">Explorar</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
