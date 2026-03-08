// Stripe plan configuration for MyTaptap
export const PLANS = {
  free: {
    name: 'Free',
    price_id: null,
    product_id: null,
    maxLinks: 5,
    price: 0,
  },
  starter: {
    name: 'Starter',
    price_id: 'price_1T8hiMF6s5PSwitkNpc5qktD',
    product_id: 'prod_U6vZCdjIF29SN7',
    maxLinks: 20,
    price: 1999, // cents
  },
  pro: {
    name: 'Pro',
    price_id: 'price_1T8hiXF6s5PSwitkQraXZXeN',
    product_id: 'prod_U6vZTPcXRFWtXQ',
    maxLinks: Infinity,
    price: 11500, // cents
  },
} as const;

export type PlanKey = keyof typeof PLANS;