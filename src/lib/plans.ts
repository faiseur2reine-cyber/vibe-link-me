// Stripe plan configuration for MyTaptap
export const PLANS = {
  free: {
    name: 'Free',
    price_id: null,
    product_id: null,
    maxLinks: 5,
    price: 0,
    interval: null,
  },
  starter: {
    name: 'Starter',
    price_id: 'price_1T8hm0F6s5PSwitkpD9F97lO',
    product_id: 'prod_U6vdnK2jJJR2CL',
    maxLinks: 20,
    price: 1999, // cents
    interval: 'month',
  },
  pro: {
    name: 'Pro',
    price_id: 'price_1T8hiXF6s5PSwitkQraXZXeN',
    product_id: 'prod_U6vZTPcXRFWtXQ',
    maxLinks: Infinity,
    price: 11500, // cents
    interval: 'year',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// Helper to get plan by price ID
export const getPlanByPriceId = (priceId: string): PlanKey => {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.price_id === priceId) return key as PlanKey;
  }
  return 'free';
};