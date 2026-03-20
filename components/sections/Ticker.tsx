const items = [
  'Depilação a laser', 'Drenagem linfática', 'Tratamentos faciais',
  'Massagem relaxante', 'Detox corporal', 'Ozônioterapia',
  'Pacote Emagrecimento', 'Profissionais certificados', 'Centro de Saúde e Estética',
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
