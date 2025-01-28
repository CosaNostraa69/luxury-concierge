export const SUBSCRIPTION_PLANS = {
    FREE: 'free',
    PREMIUM: {
      price_id: process.env.STRIPE_PREMIUM_PRICE_ID!,
      name: 'Premium',
      price: 99,
      features: [
        'Accès au marketplace',
        'Spécialités illimitées',
        'Badge "Vérifié"',
        'Mise en avant',
        'Stats détaillées'
      ]
    }
  };