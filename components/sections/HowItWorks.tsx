const steps = [
  {
    n: '1', title: 'Escolha', desc: 'Selecione o procedimento ideal para sua necessidade e objetivo estético.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    n: '2', title: 'Data', desc: 'Escolha o dia que melhor se encaixa na sua agenda no calendário interativo.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
  {
    n: '3', title: 'Horário', desc: 'Veja os horários disponíveis em tempo real e reserve o que preferir.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  },
  {
    n: '4', title: 'Pagamento', desc: 'Finalize com cartão de crédito ou Pix. Seguro e sem burocracia.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  },
  {
    n: '5', title: 'Confirmação', desc: 'Receba confirmação instantânea e adicione ao seu calendário.',
    icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
  },
];

export default function HowItWorks() {
  return (
    <section id="how">
      <div className="container">
        <div className="how-header">
          <p className="section-label reveal">Como funciona</p>
          <h2 className="section-title reveal d1">Simples, <em>rápido</em> e elegante.</h2>
          <p className="section-sub reveal d2" style={{ margin: '16px auto 0', textAlign: 'center' }}>
            Cinco passos para transformar sua rotina de cuidados.
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
