export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{ fontSize: '1.4rem' }}>
              <span>Lumière</span>
              <span className="logo-dot" />
            </div>
            <p>
              Clínica estética premium com planos de assinatura mensal.
              Procedimentos exclusivos, economia real e cuidado contínuo.
            </p>
          </div>

          <div className="footer-col">
            <h4>Procedimentos</h4>
            <ul>
              {['Limpeza de Pele','Toxina Botulínica','Preenchimento','Massagem','Laser Corporal','Drenagem Linfática'].map(p => (
                <li key={p}><a href="#procedures">{p}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Planos</h4>
            <ul>
              <li><a href="#plans">Plano Essencial</a></li>
              <li><a href="#plans">Plano Premium</a></li>
              <li><a href="#plans">Plano VIP</a></li>
              <li><a href="/cadastro">Criar conta</a></li>
              <li><a href="/login">Área do assinante</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Atendimento</h4>
            <ul>
              <li><a href="tel:+5511987654321">(11) 98765-4321</a></li>
              <li><a href="mailto:contato@lumiere.com.br">contato@lumiere.com.br</a></li>
              <li><a href="#">Seg–Sex: 8h–20h</a></li>
              <li><a href="#">Sáb: 8h–14h</a></li>
              <li><a href="#">Av. Paulista, 1000 – SP</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Lumière Estética. Todos os direitos reservados.</p>
          <p>Desenvolvido com <span style={{ color: 'var(--gold)' }}>♥</span> para uma experiência premium</p>
        </div>
      </div>
    </footer>
  );
}
