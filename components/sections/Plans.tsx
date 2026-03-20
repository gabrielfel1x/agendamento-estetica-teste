import Link from 'next/link';

export default function Plans() {
  return (
    <section id="plans">
      <div className="container">
        <div className="plans-header reveal">
          <p className="section-label">Pacote especial</p>
          <h2 className="section-title">
            Emagrecimento &<br /><em>Hipertrofia.</em>
          </h2>
        </div>
        <p className="section-sub plans-sub reveal d2">
          Protocolo completo desenvolvido para resultados expressivos em emagrecimento
          e definição muscular, com acompanhamento especializado.
        </p>

        <div className="pkg-grid reveal d2">
          <div className="pkg-card">
            <span className="pkg-badge">Pacote exclusivo</span>
            <h3 className="pkg-name">
              Emagrecimento &<br /><em>Hipertrofia</em>
            </h3>
            <ul className="pkg-items">
              {[
                '6 aplicações de enzimas',
                '4 aplicações de BCAA',
                '3 Mantas Térmicas',
                '3 Drenomodeladoras',
              ].map(item => (
                <li key={item}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <hr className="pkg-divider" />
            <div className="pkg-price">
              <p className="pkg-price-main">12x de <strong>R$ 55,99</strong></p>
              <p className="pkg-price-alt">ou R$ 599,90 à vista</p>
            </div>
            <Link href="/cadastro" className="pkg-cta">
              Quero este pacote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
