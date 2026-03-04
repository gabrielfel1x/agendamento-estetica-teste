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
              Clínica estética premium especializada em procedimentos faciais e corporais.
              Excelência, segurança e resultados que transformam.
            </p>
          </div>

          <div className="footer-col">
            <h4>Procedimentos</h4>
            <ul>
              {['Limpeza de Pele','Toxina Botulínica','Preenchimento','Massagem','Laser Corporal','Drenagem Linfática'].map(p => (
                <li key={p}><a href="#">{p}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Clínica</h4>
            <ul>
              {['Sobre nós','Nossa equipe','Certificações','Blog','Contato'].map(p => (
                <li key={p}><a href="#">{p}</a></li>
              ))}
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
