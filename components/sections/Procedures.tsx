import { PROCEDURES } from '@/lib/constants';
import Link from 'next/link';

export default function Procedures() {
  return (
    <section id="procedures">
      <div className="container">
        <div className="procedures-header">
          <div className="reveal">
            <p className="section-label">Nossos procedimentos</p>
            <h2 className="section-title">
              Tratamentos <em>feitos</em>
              <br />para você.
            </h2>
          </div>
          <p className="section-sub reveal d2">
            Cada procedimento é personalizado com protocolos de alta performance e
            materiais de excelência, aplicados por especialistas certificados.
          </p>
        </div>
      </div>

      <div className="procedures-grid">
        {PROCEDURES.map((proc, i) => (
          <div key={proc.name} className={`proc-card reveal d${i}`}>
            <img src={proc.image} alt={proc.name} />
            <div className="proc-card-body">
              <p className="proc-num">0{i + 1}</p>
              <h3 className="proc-name">
                {proc.name.split(' ').slice(0, -1).join(' ')}
                <br />
                {proc.name.split(' ').slice(-1)}
              </h3>
              <p className="proc-desc">{proc.desc}</p>
              <Link href="/login" className="proc-btn">
                Saiba mais
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <span className="proc-tag">{proc.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
