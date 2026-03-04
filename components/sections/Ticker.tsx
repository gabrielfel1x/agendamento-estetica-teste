const items = [
  'Planos a partir de R$189/mês', 'Cancele quando quiser', 'Profissionais Certificados',
  'Agendamento Prioritário', 'Condições Exclusivas', '+2.000 Assinantes',
];

export default function Ticker() {
  const doubled = [...items, ...items];
  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker">
        {doubled.map((item, i) => (
          <span key={i}>
            {item}
            <span className="ticker-dot">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
