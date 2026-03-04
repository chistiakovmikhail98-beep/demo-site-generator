export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: number;
  description: string;
}

export const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Месяц',
    price: 3000,
    currency: 'RUB',
    period: 30,
    description: 'Ежемесячная подписка',
  },
  {
    id: 'yearly',
    name: 'Год',
    price: 30000,
    currency: 'RUB',
    period: 365,
    description: 'Годовая подписка (скидка 17%)',
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id);
}
