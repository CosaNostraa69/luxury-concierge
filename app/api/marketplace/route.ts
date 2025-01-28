import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is premium concierge
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        premiumFeatures: true,
      },
    });

    if (!user?.premiumFeatures || user.role !== 'CONCIERGE') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const { type, name, description, price, category } = await req.json();

    if (type === 'product') {
      const productsCount = await prisma.product.count({
        where: { conciergeId: session.user.id },
      });

      if (productsCount >= user.premiumFeatures.maxProductListings) {
        return NextResponse.json(
          { error: 'Maximum product listings reached' },
          { status: 400 }
        );
      }

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          category,
          conciergeId: session.user.id,
        },
      });

      return NextResponse.json(product);
    } else if (type === 'service') {
      const servicesCount = await prisma.service.count({
        where: { conciergeId: session.user.id },
      });

      if (servicesCount >= user.premiumFeatures.maxServiceListings) {
        return NextResponse.json(
          { error: 'Maximum service listings reached' },
          { status: 400 }
        );
      }

      const service = await prisma.service.create({
        data: {
          name,
          description,
          price,
          category,
          duration: 60, // Default duration in minutes
          conciergeId: session.user.id,
        },
      });

      return NextResponse.json(service);
    }

    return NextResponse.json(
      { error: 'Invalid listing type' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: {
        concierge: {
          select: {
            name: true,
            image: true,
            rating: true,
          },
        },
      },
    });

    const services = await prisma.service.findMany({
      where: { available: true },
      include: {
        concierge: {
          select: {
            name: true,
            image: true,
            rating: true,
          },
        },
      },
    });

    return NextResponse.json({ products, services });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
} 