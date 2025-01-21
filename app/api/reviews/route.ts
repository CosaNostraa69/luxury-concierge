import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { conciergeId, rating, comment } = await req.json();

    if (!conciergeId || !rating || !comment) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this concierge
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        conciergeId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this concierge' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: session.user.id,
        conciergeId,
      },
    });

    // Update concierge's average rating
    const reviews = await prisma.review.findMany({
      where: { conciergeId },
      select: { rating: true },
    });

    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await prisma.user.update({
      where: { id: conciergeId },
      data: { rating: averageRating },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 