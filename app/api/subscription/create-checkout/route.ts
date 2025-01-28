import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { authOptions } from '../../auth/[...nextauth]/route';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { planId } = await req.json();

    // Test price ID - replace with your actual price ID
    const PRICE_ID = 'price_1QmLiiCUgZesFD00guLiHpBO'; // Replace this with your actual price ID

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: session.user.email ?? undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: planId
      },
    });

    if (!checkoutSession.url) {
      throw new Error('No checkout URL generated');
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}