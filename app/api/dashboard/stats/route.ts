import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalRequests,
      activeListings,
      messages,
      subscription
    ] = await Promise.all([
      prisma.request.count({
        where: {
          OR: [
            { userId: session.user.id },
            { conciergeId: session.user.id },
          ],
        },
      }),
      prisma.listing.count({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
      }),
      prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
      }),
    ]);

    return NextResponse.json({
      totalRequests,
      activeListings,
      messages,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 