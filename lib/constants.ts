import type { Procedure, Appointment } from './types';

export const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export const DAYS_PT = [
  'domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado',
];

export const TODAY = new Date(2026, 2, 4); // March 4, 2026

export const DISABLED_DAYS_MARCH = [1, 7, 8, 14, 15, 17, 21, 22, 28, 29];

export const ALL_TIMES = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
];
export const UNAVAIL_TIMES = ['09:00','10:30','14:00','15:30'];
export const LAST_TIMES    = ['11:30','17:30'];

export const PROCEDURES: Procedure[] = [
  {
    name: 'Limpeza de Pele',
    dur: '90 min',
    price: 'R$ 280',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    tag: '90 min',
    desc: 'Desobstrução profunda dos poros, remoção de impurezas e renovação celular para uma pele radiante e saudável.',
  },
  {
    name: 'Toxina Botulínica',
    dur: '45 min',
    price: 'R$ 1.200',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
    tag: '45 min',
    desc: 'Suavização de linhas de expressão com resultados naturais e duradouros. Aplicação precisa por médicos especialistas.',
  },
  {
    name: 'Preenchimento Labial',
    dur: '60 min',
    price: 'R$ 950',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    tag: '60 min',
    desc: 'Volume e definição labial com ácido hialurônico premium. Resultados harmoniosos e totalmente naturais.',
  },
  {
    name: 'Massagem Relaxante',
    dur: '60 min',
    price: 'R$ 180',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    tag: '60 min',
    desc: 'Técnica sueca e aromaterapia para alívio de tensões musculares e reequilíbrio energético profundo.',
  },
  {
    name: 'Laser Corporal',
    dur: '30–90 min',
    price: 'R$ 320',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    tag: '30–90 min',
    desc: 'Depilação definitiva e rejuvenescimento corporal com tecnologia laser de última geração. Seguro para todos os fototipos.',
  },
  {
    name: 'Drenagem Linfática',
    dur: '75 min',
    price: 'R$ 240',
    image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=800&q=80',
    tag: '75 min',
    desc: 'Estimulação do sistema linfático para redução de inchaço, desintoxicação e melhora do contorno corporal.',
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '001',
    procedure: 'Limpeza de Pele',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-10',
    time: '10:00',
    patient: 'Ana Paula Mendes',
    email: 'ana@email.com',
    phone: '(11) 98765-4321',
    price: 'R$ 280',
    status: 'confirmado',
    createdAt: '2026-03-04',
  },
  {
    id: '002',
    procedure: 'Toxina Botulínica',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-12',
    time: '14:30',
    patient: 'Camila Ferreira',
    email: 'camila@email.com',
    phone: '(11) 91234-5678',
    price: 'R$ 1.200',
    status: 'confirmado',
    createdAt: '2026-03-04',
  },
  {
    id: '003',
    procedure: 'Massagem Relaxante',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-15',
    time: '09:00',
    patient: 'Beatriz Oliveira',
    email: 'bea@email.com',
    phone: '(11) 99999-1111',
    price: 'R$ 180',
    status: 'pendente',
    createdAt: '2026-03-03',
  },
  {
    id: '004',
    procedure: 'Preenchimento Labial',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-18',
    time: '11:00',
    patient: 'Julia Santos',
    email: 'ju@email.com',
    phone: '(11) 88888-2222',
    price: 'R$ 950',
    status: 'confirmado',
    createdAt: '2026-03-02',
  },
  {
    id: '005',
    procedure: 'Laser Corporal',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-06',
    time: '15:00',
    patient: 'Mariana Costa',
    email: 'mari@email.com',
    phone: '(11) 77777-3333',
    price: 'R$ 320',
    status: 'cancelado',
    createdAt: '2026-03-01',
  },
  {
    id: '006',
    procedure: 'Drenagem Linfática',
    image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-20',
    time: '08:30',
    patient: 'Fernanda Lima',
    email: 'fer@email.com',
    phone: '(11) 66666-4444',
    price: 'R$ 240',
    status: 'pendente',
    createdAt: '2026-03-04',
  },
];
