export type Plan = {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: string;
  scansPerMonth: number | 'unlimited';
  features: string[];
};

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    scansPerMonth: 5,
    features: ['5 scans per month', 'Basic detection', '7-day history'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    scansPerMonth: 'unlimited',
    features: ['Unlimited scans', 'Advanced forensics', 'Unlimited history', 'Export reports'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    scansPerMonth: 'unlimited',
    features: ['Everything in Pro', 'API access', 'SLA support', 'On-premise option'],
  },
];