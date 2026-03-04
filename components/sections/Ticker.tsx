const items = [
  'Agendamento Online 24h', 'Confirmação Imediata', 'Profissionais Certificados',
  '+12.000 Atendimentos', 'Pagamento Seguro', 'Reagendamento Fácil',
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
