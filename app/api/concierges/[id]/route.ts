import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const concierge = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'CONCIERGE',
      },
      select: {
        id: true,
        name: true,
        image: true,
        specialties: true,
        bio: true,
        rating: true,
        receivedReviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!concierge) {
      return NextResponse.json(
        { message: 'Concierge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(concierge);
  } catch (error) {
    console.error('Error fetching concierge:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 