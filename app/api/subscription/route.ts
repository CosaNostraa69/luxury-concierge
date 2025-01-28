import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        status: true,
        currentPeriodEnd: true
      }
    });

    return NextResponse.json({
      planId: subscription ? 'premium' : 'free',
      subscription: subscription || null
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch subscription' }, 
      { status: 500 }
    );
  }
}