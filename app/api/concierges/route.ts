import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty') || 'all';

    const where = specialty !== 'all' 
      ? {
          role: 'CONCIERGE' as const,
          specialties: {
            some: {
              id: specialty
            }
          }
        }
      : { role: 'CONCIERGE' as const };

    const concierges = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        specialties: true,
        bio: true,
        rating: true,
        _count: {
          select: {
            receivedReviews: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    const formattedConcierges = concierges.map(concierge => ({
      ...concierge,
      reviewCount: concierge._count.receivedReviews,
      _count: undefined,
    }));

    return NextResponse.json(formattedConcierges);
  } catch (error) {
    console.error('Error fetching concierges:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 