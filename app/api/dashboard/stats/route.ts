import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../../../app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const [totalRequests, activeListings, totalMessages] = await Promise.all([
      // Nombre total de requêtes
      prisma.request.count({
        where: {
          OR: [
            { userId: session.user.id },
            { conciergeId: session.user.id }
          ]
        }
      }),

      // Annonces actives
      prisma.listing.count({
        where: {
          userId: session.user.id,
          status: 'ACTIVE'
        }
      }),

      // Total des messages
      prisma.message.count({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
        }
      })
    ]);

    return NextResponse.json({
      totalRequests,
      activeListings,
      messages: totalMessages
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}