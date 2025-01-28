'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session) {
        router.push('/api/auth/signin');
        return;
      }

      try {
        const res = await fetch('/api/subscription');
        if (!res.ok) {
          throw new Error('Failed to fetch subscription');
        }
        const data = await res.json();
        setCurrentPlan(data.planId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [session, router]);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="border rounded-lg p-8 bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Free Plan</h2>
          <p className="mt-4 text-gray-500">Basic features for personal use</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">$0/month</p>
          <ul className="mt-6 space-y-4">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Basic profile
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Standard support
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Basic visibility
            </li>
            <li className="flex items-start text-gray-400">
              <span className="text-red-500 mr-2">✗</span>
              No marketplace access
            </li>
            <li className="flex items-start text-gray-400">
              <span className="text-red-500 mr-2">✗</span>
              Standard commission rate
            </li>
          </ul>
          <button
            onClick={() => handleSubscribe('free')}
            disabled={currentPlan === 'free'}
            className="mt-8 w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {currentPlan === 'free' ? 'Current Plan' : 'Select Free Plan'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="border rounded-lg p-8 bg-gradient-to-br from-white to-indigo-50 shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
            Popular
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Premium Plan</h2>
          <p className="mt-4 text-gray-500">Advanced features for professionals</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">$29.99/month</p>
          <ul className="mt-6 space-y-4">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Priority Support 24/7
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Extended Availability Hours
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Custom Branding Options
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Advanced Analytics Access
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Up to 50 Client Slots
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Reduced 15% Commission Rate
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Verified Status Badge
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Marketplace Access
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Up to 50 Product Listings
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Up to 20 Service Listings
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Featured Profile Listing
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Enhanced Search Visibility
            </li>
          </ul>
          <button
            onClick={() => handleSubscribe('premium')}
            disabled={currentPlan === 'premium'}
            className="mt-8 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {currentPlan === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center mt-8">
          {error}
        </div>
      )}
    </div>
  );
}