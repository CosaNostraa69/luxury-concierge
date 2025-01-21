'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  interval: 'month' | 'year';
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    interval: 'month',
    features: [
      'Access to basic concierge services',
      'Email support',
      'Standard response time',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    interval: 'month',
    features: [
      'Priority concierge services',
      '24/7 phone support',
      'Fast response time',
      'Exclusive events access',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 499,
    interval: 'month',
    features: [
      'Dedicated personal concierge',
      'VIP support',
      'Instant response time',
      'Exclusive events access',
      'Private jet booking',
      'Luxury vehicle rentals',
    ],
  },
];

export default function Subscription() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/subscription');
        const data = await res.json();
        setCurrentPlan(data.planId);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleSubscribe = async (planId: string) => {
    try {
      const res = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
          <p className="mt-2 text-gray-600">You need to be signed in to view subscription plans.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="mt-4 text-xl text-gray-600">Choose the perfect plan for your luxury lifestyle</p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden ${
              currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <p className="mt-4">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-green-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={currentPlan === plan.id}
                className={`mt-8 w-full px-4 py-2 rounded-md ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 