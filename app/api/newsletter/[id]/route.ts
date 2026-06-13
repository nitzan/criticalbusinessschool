import { NextRequest, NextResponse } from 'next/server';
import { getInstructorUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Instructor-only: fetch a single newsletter with delivery stats.
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructor = await getInstructorUser(request);

    if (!instructor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        deliveries: {
          include: {
            subscriber: { select: { id: true, email: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    const stats = {
      total: newsletter.deliveries.length,
      sent: newsletter.deliveries.filter((d) => d.status === 'SENT').length,
      failed: newsletter.deliveries.filter((d) => d.status === 'FAILED').length,
      pending: newsletter.deliveries.filter((d) => d.status === 'PENDING').length,
    };

    return NextResponse.json({ ...newsletter, stats }, { status: 200 });
  } catch (error) {
    console.error('Get newsletter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Instructor-only: edit a draft. Sent newsletters are immutable.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructor = await getInstructorUser(request);

    if (!instructor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id },
    });

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    if (newsletter.status === 'SENT') {
      return NextResponse.json(
        { error: 'A sent newsletter cannot be edited' },
        { status: 400 }
      );
    }

    const { subject, content } = await request.json();

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.newsletter.update({
      where: { id: params.id },
      data: { subject: subject.trim(), content },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Update newsletter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Instructor-only: delete a newsletter and its delivery records.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructor = await getInstructorUser(request);

    if (!instructor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id },
    });

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    await prisma.newsletter.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Newsletter deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete newsletter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
