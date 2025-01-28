import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          // Update user with premium benefits
          await prisma.user.update({
            where: { id: userId },
            data: {
              role: 'CONCIERGE',
              premiumFeatures: {
                create: {
                  prioritySupport: true,
                  extendedAvailability: true,
                  customBranding: true,
                  analyticsAccess: true,
                  maxClientsCount: 50,
                  commissionRate: 15, // 15% commission instead of standard rate
                  verifiedStatus: true,
                  canSellProducts: true,
                  canOfferServices: true,
                  maxProductListings: 50,
                  maxServiceListings: 20
                }
              },
              profile: {
                upsert: {
                  create: {
                    isPremium: true,
                    featuredListing: true,
                    enhancedVisibility: true,
                    premiumBadge: true
                  },
                  update: {
                    isPremium: true,
                    featuredListing: true,
                    enhancedVisibility: true,
                    premiumBadge: true
                  }
                }
              }
            }
          });
        }

        if (!userId) {
          throw new Error('No userId in session metadata');
        }

        // Mettre à jour le rôle de l'utilisateur
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date((session.expires_at || Date.now()) * 1000)
          },
          update: {
            status: 'ACTIVE',
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date((session.expires_at || Date.now()) * 1000)
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'CANCELLED',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const sub = await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELLED',
            cancelAtPeriodEnd: false,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          include: {
            user: true
          }
        });

        // Optionnel : rétrograder le rôle de l'utilisateur quand l'abonnement se termine
        if (sub.user && new Date() >= new Date(subscription.current_period_end * 1000)) {
          await prisma.user.update({
            where: { id: sub.userId },
            data: { role: 'USER' }
          });
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}