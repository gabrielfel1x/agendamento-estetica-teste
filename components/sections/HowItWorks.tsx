const steps = [
  {
    n: '1', title: 'Explore', desc: 'Navegue pelo catálogo de serviços e encontre o tratamento ideal — facial, corporal, laser ou pacote.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  },
  {
    n: '2', title: 'Cadastre-se', desc: 'Crie sua conta em segundos com nome, e-mail e senha. Rápido, gratuito e sem burocracia.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    n: '3', title: 'Agende', desc: 'Escolha a data e horário disponíveis e confirme seu agendamento com facilidade pelo aplicativo.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    n: '4', title: 'Compareça', desc: 'Venha à Depill plus no dia combinado. Nossa equipe estará pronta para recebê-la com atenção e cuidado.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    n: '5', title: 'Aproveite', desc: 'Sinta os resultados, acompanhe seu histórico pelo painel e agende sua próxima sessão quando quiser.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  },
];

export default function HowItWorks() {
  return (
    <section id="how">
      <div className="container">
        <div className="how-header">
          <p className="section-label reveal">Como funciona</p>
          <h2 className="section-title reveal d1">Agende em <em>minutos</em>, cuide o mês todo.</h2>
          <p className="section-sub reveal d2" style={{ margin: '16px auto 0', textAlign: 'center' }}>
            Cinco passos simples para começar sua jornada de cuidados na Depill plus.
          </p>
        </div>

        <div className="steps-wrapper">
          <div className="steps-line">
            <div className="steps-line-fill reveal" />
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={s.n} className={`step-item reveal d${i}`}>
                <div className="step-circle">
                  <span className="step-num">{s.n}</span>
                  <span className="step-badge">{s.icon}</span>
                </div>
                <div>
                  <h4 className="step-title">{s.title}</h4>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
