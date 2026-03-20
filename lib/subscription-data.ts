export interface Plan {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  desc: string;
  features: string[];
  popular: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 'R$ 189',
    priceNum: 189,
    desc: 'Para quem busca cuidados básicos com excelência.',
    features: [
      '1 Limpeza de pele por mês',
      '1 Massagem relaxante por mês',
      'Agendamento prioritário',
      'Desconto de 10% em procedimentos avulsos',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 389',
    priceNum: 389,
    desc: 'O equilíbrio perfeito entre cuidado e sofisticação.',
    features: [
      '2 procedimentos por mês à escolha',
      'Drenagem linfática incluída',
      'Agendamento prioritário',
      'Desconto de 20% em avulsos',
      'Acesso ao app exclusivo',
    ],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 'R$ 689',
    priceNum: 689,
    desc: 'Experiência completa para quem merece o melhor.',
    features: [
      'Procedimentos ilimitados*',
      'Depilação a laser com 30% off',
      'Horários exclusivos',
      'Atendimento personalizado',
      'Desconto de 30% em procedimentos premium',
      'Concierge dedicado via WhatsApp',
    ],
    popular: false,
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id);
}
