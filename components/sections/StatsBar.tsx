const stats = [
  { number: '12k+', label: 'Atendimentos realizados' },
  { number: '98%',  label: 'Pacientes satisfeitas'  },
  { number: '8',    label: 'Anos de excelência'      },
  { number: '24h',  label: 'Agendamento disponível'  },
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
