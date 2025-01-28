import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conciergeId, rating, comment } = await req.json();

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId: session.user.id,
        conciergeId
      }
    });

    // Calculate new average
    const reviews = await prisma.review.findMany({
      where: { conciergeId },
      select: { rating: true }
    });

    const averageRating = 
      reviews.reduce((acc, rev: { rating: number }) => acc + rev.rating, 0) / reviews.length;

    await prisma.user.update({
      where: { id: conciergeId },
      data: { rating: averageRating }
    });

    return NextResponse.json({ success: true, review });
  } catch {
    return NextResponse.json({ 
      error: 'Failed to submit review'
    }, { status: 500 });
  }
}