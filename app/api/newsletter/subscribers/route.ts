import { NextRequest, NextResponse } from 'next/server';
import { getInstructorUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Instructor-only: list newsletter subscribers.
export async function GET(request: NextRequest) {
  try {
    const instructor = await getInstructorUser(request);

    if (!instructor) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status === 'SUBSCRIBED' || status === 'UNSUBSCRIBED') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subscribers, subscribedCount] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } }),
    ]);

    return NextResponse.json({ subscribers, subscribedCount }, { status: 200 });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
