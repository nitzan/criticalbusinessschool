import { NextRequest, NextResponse } from 'next/server';
import { getInstructorUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Instructor-only: list all newsletters (drafts and sent).
export async function GET(request: NextRequest) {
  try {
    const instructor = await getInstructorUser(request);

    if (!instructor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsletters = await prisma.newsletter.findMany({
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { deliveries: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(newsletters, { status: 200 });
  } catch (error) {
    console.error('Get newsletters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Instructor-only: create a draft newsletter.
export async function POST(request: NextRequest) {
  try {
    const instructor = await getInstructorUser(request);

    if (!instructor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, content } = await request.json();

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        subject: subject.trim(),
        content,
        authorId: instructor.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { deliveries: true } },
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.error('Create newsletter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
