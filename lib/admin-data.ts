export interface AdminAppointment {
  id: string;
  patient: string;
  phone: string;
  procedure: string;
  priceNum: number;
  price: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
}

export const ADMIN_APPOINTMENTS: AdminAppointment[] = [
  // Março 3 (seg)
  { id:'a01', patient:'Sophia Andrade',     phone:'11987651001', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-03', time:'09:00', status:'confirmado' },
  { id:'a02', patient:'Isabela Torres',     phone:'11987651002', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-03', time:'14:30', status:'confirmado' },

  // Março 4 (ter) — hoje
  { id:'a03', patient:'Camila Rodrigues',   phone:'11987651003', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-04', time:'10:00', status:'confirmado' },
  { id:'a04', patient:'Larissa Nunes',      phone:'11987651004', procedure:'Drenagem Linfática',  priceNum:240,  price:'R$ 240',   date:'2026-03-04', time:'14:30', status:'pendente'   },

  // Março 5 (qua)
  { id:'a05', patient:'Fernanda Lima',      phone:'11987651005', procedure:'Preenchimento Labial',priceNum:950,  price:'R$ 950',   date:'2026-03-05', time:'09:30', status:'confirmado' },
  { id:'a06', patient:'Bianca Souza',       phone:'11987651006', procedure:'Laser Corporal',      priceNum:320,  price:'R$ 320',   date:'2026-03-05', time:'11:00', status:'confirmado' },
  { id:'a07', patient:'Natalia Carvalho',   phone:'11987651007', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-05', time:'15:00', status:'pendente'   },

  // Março 6 (qui)
  { id:'a08', patient:'Priscila Melo',      phone:'11987651008', procedure:'Toxina Botulínica',   priceNum:1200, price:'R$ 1.200', date:'2026-03-06', time:'10:00', status:'confirmado' },
  { id:'a09', patient:'Gabriela Alves',     phone:'11987651009', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-06', time:'16:00', status:'confirmado' },

  // Março 9 (seg)
  { id:'a10', patient:'Amanda Ramos',       phone:'11987651010', procedure:'Drenagem Linfática',  priceNum:240,  price:'R$ 240',   date:'2026-03-09', time:'08:30', status:'confirmado' },
  { id:'a11', patient:'Leticia Barbosa',    phone:'11987651011', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-09', time:'11:00', status:'confirmado' },
  { id:'a12', patient:'Juliana Freitas',    phone:'11987651012', procedure:'Laser Corporal',      priceNum:320,  price:'R$ 320',   date:'2026-03-09', time:'14:00', status:'cancelado'  },

  // Março 10 (ter)
  { id:'a13', patient:'Ana Paula Mendes',   phone:'11987651013', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-10', time:'10:00', status:'confirmado' },
  { id:'a14', patient:'Rebeca Monteiro',    phone:'11987651014', procedure:'Preenchimento Labial',priceNum:950,  price:'R$ 950',   date:'2026-03-10', time:'13:30', status:'confirmado' },

  // Março 11 (qua)
  { id:'a15', patient:'Vanessa Pinto',      phone:'11987651015', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-11', time:'09:00', status:'confirmado' },
  { id:'a16', patient:'Carolina Dias',      phone:'11987651016', procedure:'Toxina Botulínica',   priceNum:1200, price:'R$ 1.200', date:'2026-03-11', time:'14:00', status:'pendente'   },
  { id:'a17', patient:'Thaís Oliveira',     phone:'11987651017', procedure:'Drenagem Linfática',  priceNum:240,  price:'R$ 240',   date:'2026-03-11', time:'16:30', status:'confirmado' },

  // Março 12 (qui)
  { id:'a18', patient:'Camila Ferreira',    phone:'11987651018', procedure:'Toxina Botulínica',   priceNum:1200, price:'R$ 1.200', date:'2026-03-12', time:'11:00', status:'confirmado' },
  { id:'a19', patient:'Mariana Costa',      phone:'11987651019', procedure:'Laser Corporal',      priceNum:320,  price:'R$ 320',   date:'2026-03-12', time:'15:30', status:'confirmado' },

  // Março 13 (sex)
  { id:'a20', patient:'Patricia Santos',    phone:'11987651020', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-13', time:'08:00', status:'confirmado' },
  { id:'a21', patient:'Rodrigo Silva',      phone:'11987651021', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-13', time:'10:30', status:'confirmado' },
  { id:'a22', patient:'Aline Ferreira',     phone:'11987651022', procedure:'Preenchimento Labial',priceNum:950,  price:'R$ 950',   date:'2026-03-13', time:'13:00', status:'pendente'   },

  // Março 16 (seg)
  { id:'a23', patient:'Bruna Nascimento',   phone:'11987651023', procedure:'Drenagem Linfática',  priceNum:240,  price:'R$ 240',   date:'2026-03-16', time:'09:30', status:'confirmado' },
  { id:'a24', patient:'Kelly Araujo',       phone:'11987651024', procedure:'Laser Corporal',      priceNum:320,  price:'R$ 320',   date:'2026-03-16', time:'14:30', status:'confirmado' },

  // Março 17 (ter)
  { id:'a25', patient:'Miriam Correia',     phone:'11987651025', procedure:'Toxina Botulínica',   priceNum:1200, price:'R$ 1.200', date:'2026-03-17', time:'10:00', status:'confirmado' },
  { id:'a26', patient:'Soraya Lima',        phone:'11987651026', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-17', time:'15:00', status:'confirmado' },

  // Março 18 (qua)
  { id:'a27', patient:'Julia Santos',       phone:'11987651027', procedure:'Preenchimento Labial',priceNum:950,  price:'R$ 950',   date:'2026-03-18', time:'11:00', status:'confirmado' },
  { id:'a28', patient:'Debora Vieira',      phone:'11987651028', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-18', time:'14:00', status:'pendente'   },
  { id:'a29', patient:'Elaine Castro',      phone:'11987651029', procedure:'Drenagem Linfática',  priceNum:240,  price:'R$ 240',   date:'2026-03-18', time:'16:00', status:'confirmado' },

  // Março 19 (qui)
  { id:'a30', patient:'Sueli Martins',      phone:'11987651030', procedure:'Laser Corporal',      priceNum:320,  price:'R$ 320',   date:'2026-03-19', time:'09:00', status:'confirmado' },
  { id:'a31', patient:'Viviane Campos',     phone:'11987651031', procedure:'Toxina Botulínica',   priceNum:1200, price:'R$ 1.200', date:'2026-03-19', time:'13:30', status:'confirmado' },

  // Março 20 (sex)
  { id:'a32', patient:'Fernanda Lima',      phone:'11987651032', procedure:'Drenagem Linfática',  priceNum:240,  price:'R$ 240',   date:'2026-03-20', time:'08:30', status:'confirmado' },
  { id:'a33', patient:'Cristiane Lopes',    phone:'11987651033', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-20', time:'11:30', status:'confirmado' },

  // Março 23 (seg)
  { id:'a34', patient:'Rosangela Pereira',  phone:'11987651034', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-23', time:'09:00', status:'confirmado' },
  { id:'a35', patient:'Ingrid Moura',       phone:'11987651035', procedure:'Preenchimento Labial',priceNum:950,  price:'R$ 950',   date:'2026-03-23', time:'14:00', status:'pendente'   },

  // Março 24 (ter)
  { id:'a36', patient:'Tatiana Bezerra',    phone:'11987651036', procedure:'Toxina Botulínica',   priceNum:1200, price:'R$ 1.200', date:'2026-03-24', time:'10:30', status:'confirmado' },
  { id:'a37', patient:'Mônica Rocha',       phone:'11987651037', procedure:'Laser Corporal',      priceNum:320,  price:'R$ 320',   date:'2026-03-24', time:'15:00', status:'confirmado' },

  // Março 25 (qua)
  { id:'a38', patient:'Adriana Cunha',      phone:'11987651038', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-25', time:'09:30', status:'confirmado' },
  { id:'a39', patient:'Sandra Teixeira',    phone:'11987651039', procedure:'Drenagem Linfática',  priceNum:240,  price:'R$ 240',   date:'2026-03-25', time:'13:00', status:'pendente'   },
  { id:'a40', patient:'Luciana Fonseca',    phone:'11987651040', procedure:'Limpeza de Pele',     priceNum:280,  price:'R$ 280',   date:'2026-03-25', time:'16:00', status:'confirmado' },

  // Março 26 (qui)
  { id:'a41', patient:'Denise Gomes',       phone:'11987651041', procedure:'Toxina Botulínica',   priceNum:1200, price:'R$ 1.200', date:'2026-03-26', time:'11:00', status:'confirmado' },
  { id:'a42', patient:'Raquel Henrique',    phone:'11987651042', procedure:'Laser Corporal',      priceNum:320,  price:'R$ 320',   date:'2026-03-26', time:'14:30', status:'confirmado' },

  // Março 27 (sex)
  { id:'a43', patient:'Alice Borges',       phone:'11987651043', procedure:'Preenchimento Labial',priceNum:950,  price:'R$ 950',   date:'2026-03-27', time:'10:00', status:'confirmado' },
  { id:'a44', patient:'Heloisa Cavalcante', phone:'11987651044', procedure:'Massagem Relaxante',  priceNum:180,  price:'R$ 180',   date:'2026-03-27', time:'14:00', status:'confirmado' },
];

// Helpers
let _nextId = 100;
export function addAppointment(data: Omit<AdminAppointment, 'id'>): AdminAppointment {
  const apt: AdminAppointment = { id: `u${_nextId++}`, ...data };
  ADMIN_APPOINTMENTS.push(apt);
  return apt;
}

export function getAppointmentsByDay(dateStr: string): AdminAppointment[] {
  return ADMIN_APPOINTMENTS.filter(a => a.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
}

export function getOccupancyByDate(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const a of ADMIN_APPOINTMENTS) {
    if (a.status !== 'cancelado') map[a.date] = (map[a.date] || 0) + 1;
  }
  return map;
}

export function getTotalRevenue(): number {
  return ADMIN_APPOINTMENTS.filter(a => a.status === 'confirmado').reduce((s,a) => s + a.priceNum, 0);
}

export function getTicketMedio(): number {
  const confirmed = ADMIN_APPOINTMENTS.filter(a => a.status === 'confirmado');
  if (!confirmed.length) return 0;
  return Math.round(getTotalRevenue() / confirmed.length);
}

export function getWeekdayCounts(): number[] {
  // Returns count for Mon(1)..Sat(6) → index 0..5
  const counts = [0, 0, 0, 0, 0, 0];
  for (const a of ADMIN_APPOINTMENTS) {
    if (a.status === 'cancelado') continue;
    const d = new Date(a.date + 'T12:00:00');
    const wd = d.getDay(); // 0=Sun
    if (wd >= 1 && wd <= 6) counts[wd - 1]++;
  }
  return counts;
}

export function getNextAppointment(): AdminAppointment | null {
  const today = '2026-03-04';
  const upcoming = ADMIN_APPOINTMENTS
    .filter(a => a.date >= today && a.status !== 'cancelado')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return upcoming[0] || null;
}
