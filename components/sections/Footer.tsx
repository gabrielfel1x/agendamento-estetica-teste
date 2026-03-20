export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.svg" alt="Depill plus" className="footer-logo-img" />
              <div>
                <span className="footer-logo-name">Depill plus</span>
                <span className="footer-logo-sub">Centro de Saúde e Estética</span>
              </div>
            </div>
            <p>
              Tratamentos estéticos faciais, corporais e depilação a laser
              com profissionais certificados e atendimento personalizado.
            </p>
            <a
              href="https://www.instagram.com/depillplusestetica/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-insta"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              @depillplusestetica
            </a>
          </div>

          <div className="footer-col">
            <h4>Serviços</h4>
            <ul>
              {[
                'Limpeza de pele',
                'Drenagem linfática',
                'Massagem relaxante',
                'Depilação a laser',
                'Revitalização facial',
                'Detox corporal',
              ].map(p => (
                <li key={p}><a href="#services">{p}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Pacote</h4>
            <ul>
              <li><a href="#plans">Emagrecimento e Hipertrofia</a></li>
              <li><a href="#plans">12x de R$ 55,99</a></li>
              <li><a href="#plans">ou R$ 599,90 à vista</a></li>
              <li style={{ marginTop: '12px' }}><a href="/cadastro">Criar conta</a></li>
              <li><a href="/login">Área do cliente</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Siga a gente</h4>
            <ul>
              <li>
                <a
                  href="https://www.instagram.com/depillplusestetica/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Depill plus. Todos os direitos reservados.</p>
          <p>Centro de Saúde e Estética</p>
        </div>
      </div>
    </footer>
  );
}
