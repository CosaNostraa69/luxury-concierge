import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Fonction utilitaire pour extraire l'ID de l'URL
function extractId(request: Request): string {
  const segments = request.url.split('/');
  return segments[segments.length - 1];
}

export async function GET(request: Request) {
  try {
    const id = extractId(request);

    const concierge = await prisma.user.findUnique({
      where: {
        id,
        role: 'CONCIERGE',
      },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        rating: true,
        specialties: {
          select: {
            id: true,
            name: true,
          },
        },
        profile: {
          select: {
            rating: true,
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
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
        },
      },
    });

    if (!concierge) {
      return NextResponse.json(
        { error: 'Concierge not found' },
        { status: 404 }
      );
    }

    const formattedConcierge = {
      id: concierge.id,
      name: concierge.name,
      bio: concierge.bio,
      image: concierge.image,
      rating: concierge.profile?.rating || 0,
      specialties: concierge.specialties,
      reviews: concierge.profile?.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: {
          name: review.user.name
        }
      })) || []
    };

    return NextResponse.json(formattedConcierge);

  } catch (error) {
    console.error('Error in GET /api/concierges/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch concierge data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const id = extractId(request);
    const body = await request.json();
    
    const updatedConcierge = await prisma.user.update({
      where: {
        id,
      },
      data: {
        bio: body.bio,
        specialties: body.specialties,
      },
    });

    return NextResponse.json(updatedConcierge);
  } catch (error) {
    console.error('Error updating concierge:', error);
    return NextResponse.json(
      { error: 'Error updating concierge data' },
      { status: 500 }
    );
  }
}