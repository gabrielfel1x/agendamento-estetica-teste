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
    dur: '60 min',
    price: 'R$ 120',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    tag: 'R$ 120',
    desc: 'Desobstrução profunda dos poros, remoção de impurezas e renovação celular para uma pele radiante e saudável.',
  },
  {
    name: 'Drenagem Linfática',
    dur: '75 min',
    price: 'R$ 180',
    image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=800&q=80',
    tag: 'R$ 180',
    desc: 'Estimulação do sistema linfático para redução de inchaço, desintoxicação e melhora do contorno corporal.',
  },
  {
    name: 'Massagem Relaxante',
    dur: '60 min',
    price: 'R$ 130',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    tag: 'R$ 130',
    desc: 'Técnica de relaxamento profundo para alívio de tensões musculares e reequilíbrio energético.',
  },
  {
    name: 'Revitalização Facial',
    dur: '75 min',
    price: 'R$ 195',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
    tag: 'R$ 195',
    desc: 'Protocolo completo de nutrição e hidratação da pele para um aspecto jovem, luminoso e renovado.',
  },
  {
    name: 'Depilação a Laser',
    dur: '30–90 min',
    price: 'a partir de R$ 60',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    tag: 'a partir R$ 60',
    desc: 'Depilação definitiva com tecnologia laser de última geração. Seguro para todos os fototipos.',
  },
  {
    name: 'Detox Corporal',
    dur: '90 min',
    price: 'R$ 200',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    tag: 'R$ 200',
    desc: 'Protocolo de desintoxicação profunda que elimina toxinas, reduz medidas e revitaliza o organismo.',
  },
];

export interface ProcedureItem {
  name: string;
  price: string;
  priceNum: number;
}

export const PROCEDURE_CATALOG: ProcedureItem[] = [
  { name: 'Limpeza de pele',                        price: 'R$ 120',    priceNum: 120  },
  { name: 'Drenagem linfática',                     price: 'R$ 180',    priceNum: 180  },
  { name: 'Dreno modeladora',                       price: 'R$ 195',    priceNum: 195  },
  { name: 'Modeladora',                             price: 'R$ 150',    priceNum: 150  },
  { name: 'Detox corporal',                         price: 'R$ 200',    priceNum: 200  },
  { name: 'Drenagem facial',                        price: 'R$ 97',     priceNum: 97   },
  { name: 'Massagem relaxante',                     price: 'R$ 130',    priceNum: 130  },
  { name: 'Massagem relaxante c/ pedras quentes',   price: 'R$ 195',    priceNum: 195  },
  { name: 'Pós operatório',                         price: 'R$ 180',    priceNum: 180  },
  { name: 'Ozônioterapia',                          price: 'R$ 100',    priceNum: 100  },
  { name: 'Ventosa terapia',                        price: 'R$ 95',     priceNum: 95   },
  { name: 'Liberação',                              price: 'R$ 100',    priceNum: 100  },
  { name: 'Terapia capilar',                        price: 'R$ 95',     priceNum: 95   },
  { name: 'Spa dos pés',                            price: 'R$ 50',     priceNum: 50   },
  { name: 'Tratamento para celulite',               price: 'R$ 180',    priceNum: 180  },
  { name: 'Tratamento para gordura localizada',     price: 'R$ 200',    priceNum: 200  },
  { name: 'Revitalização facial',                   price: 'R$ 195',    priceNum: 195  },
  { name: 'Rejuvenescimento facial',                price: 'R$ 195',    priceNum: 195  },
  { name: 'Tratamento para flacidez',               price: 'R$ 198',    priceNum: 198  },
  { name: 'Depilação a laser — Perna completa',     price: 'R$ 200',    priceNum: 200  },
  { name: 'Depilação a laser — Meia perna',         price: 'R$ 150',    priceNum: 150  },
  { name: 'Depilação a laser — Axila',              price: 'R$ 60',     priceNum: 60   },
  { name: 'Depilação a laser — Peitoral e tronco',  price: 'R$ 200',    priceNum: 200  },
  { name: 'Depilação a laser — Contorno simples',   price: 'R$ 100',    priceNum: 100  },
  { name: 'Depilação a laser — Contorno completo',  price: 'R$ 150',    priceNum: 150  },
  { name: 'Depilação a laser — Barba',              price: 'R$ 80',     priceNum: 80   },
  { name: 'Revitalização labial',                   price: 'R$ 60',     priceNum: 60   },
  { name: 'Pacote Emagrecimento e Hipertrofia',     price: 'R$ 599,90', priceNum: 600  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '001',
    procedure: 'Limpeza de pele',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-10',
    time: '10:00',
    patient: 'Ana Paula Mendes',
    email: 'ana@email.com',
    phone: '(11) 98765-4321',
    price: 'R$ 120',
    status: 'confirmado',
    createdAt: '2026-03-04',
  },
  {
    id: '002',
    procedure: 'Drenagem linfática',
    image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-12',
    time: '14:30',
    patient: 'Camila Ferreira',
    email: 'camila@email.com',
    phone: '(11) 91234-5678',
    price: 'R$ 180',
    status: 'confirmado',
    createdAt: '2026-03-04',
  },
  {
    id: '003',
    procedure: 'Massagem relaxante',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-15',
    time: '09:00',
    patient: 'Beatriz Oliveira',
    email: 'bea@email.com',
    phone: '(11) 99999-1111',
    price: 'R$ 130',
    status: 'pendente',
    createdAt: '2026-03-03',
  },
  {
    id: '004',
    procedure: 'Revitalização facial',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-18',
    time: '11:00',
    patient: 'Julia Santos',
    email: 'ju@email.com',
    phone: '(11) 88888-2222',
    price: 'R$ 195',
    status: 'confirmado',
    createdAt: '2026-03-02',
  },
  {
    id: '005',
    procedure: 'Depilação a laser — Perna completa',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-06',
    time: '15:00',
    patient: 'Mariana Costa',
    email: 'mari@email.com',
    phone: '(11) 77777-3333',
    price: 'R$ 200',
    status: 'cancelado',
    createdAt: '2026-03-01',
  },
  {
    id: '006',
    procedure: 'Detox corporal',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=120&q=75',
    date: '2026-03-20',
    time: '08:30',
    patient: 'Fernanda Lima',
    email: 'fer@email.com',
    phone: '(11) 66666-4444',
    price: 'R$ 200',
    status: 'pendente',
    createdAt: '2026-03-04',
  },
];
