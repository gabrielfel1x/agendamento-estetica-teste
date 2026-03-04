import { ADMIN_APPOINTMENTS, AdminAppointment } from './admin-data';

export interface Cliente {
  id: string;
  name: string;
  phone: string;
  email: string;
  since: string; // YYYY-MM-DD
}

export const CLIENTES: Cliente[] = [
  { id:'c01', name:'Sophia Andrade',     phone:'11987651001', email:'sophia@email.com',    since:'2026-01-15' },
  { id:'c02', name:'Isabela Torres',     phone:'11987651002', email:'isabela@email.com',   since:'2026-01-22' },
  { id:'c03', name:'Camila Rodrigues',   phone:'11987651003', email:'camila@email.com',    since:'2025-11-08' },
  { id:'c04', name:'Larissa Nunes',      phone:'11987651004', email:'larissa@email.com',   since:'2026-02-03' },
  { id:'c05', name:'Fernanda Lima',      phone:'11987651005', email:'fernanda@email.com',  since:'2025-10-14' },
  { id:'c06', name:'Bianca Souza',       phone:'11987651006', email:'bianca@email.com',    since:'2026-01-30' },
  { id:'c07', name:'Priscila Melo',      phone:'11987651008', email:'priscila@email.com',  since:'2025-09-20' },
  { id:'c08', name:'Amanda Ramos',       phone:'11987651010', email:'amanda@email.com',    since:'2025-12-01' },
  { id:'c09', name:'Ana Paula Mendes',   phone:'11987651013', email:'ana@email.com',       since:'2025-08-15' },
  { id:'c10', name:'Camila Ferreira',    phone:'11987651018', email:'camilaf@email.com',   since:'2025-07-22' },
  { id:'c11', name:'Julia Santos',       phone:'11987651027', email:'julia@email.com',     since:'2025-11-30' },
  { id:'c12', name:'Tatiana Bezerra',    phone:'11987651036', email:'tatiana@email.com',   since:'2026-01-05' },
];

export function getClienteHistory(clientePhone: string): AdminAppointment[] {
  return ADMIN_APPOINTMENTS
    .filter(a => a.phone === clientePhone)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getClienteTotalAppointments(clientePhone: string): number {
  return ADMIN_APPOINTMENTS.filter(a => a.phone === clientePhone && a.status !== 'cancelado').length;
}

export function getClienteLastProcedure(clientePhone: string): string | null {
  const history = getClienteHistory(clientePhone).filter(a => a.status !== 'cancelado');
  return history[0]?.procedure || null;
}
