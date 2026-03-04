const stats = [
  { number: '2k+',  label: 'Assinantes ativos'       },
  { number: '98%',  label: 'Taxa de satisfação'       },
  { number: '40%',  label: 'Economia média mensal'    },
  { number: '3',    label: 'Planos disponíveis'       },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="container">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <div key={s.label} className={`reveal d${i}`}>
              <p className="stat-number">{s.number}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
