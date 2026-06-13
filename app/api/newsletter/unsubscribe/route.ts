import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function unsubscribeByToken(token: string | null) {
  if (!token) {
    return NextResponse.json(
      { error: 'An unsubscribe token is required' },
      { status: 400 }
    );
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { token },
  });

  if (!subscriber) {
    return NextResponse.json(
      { error: 'Invalid or expired unsubscribe link' },
      { status: 404 }
    );
  }

  if (subscriber.status !== 'UNSUBSCRIBED') {
    await prisma.newsletterSubscriber.update({
      where: { token },
      data: { status: 'UNSUBSCRIBED' },
    });
  }

  return NextResponse.json(
    { message: 'You have been unsubscribed', email: subscriber.email },
    { status: 200 }
  );
}

// Public endpoint: supports both a GET link (one-click from email) and POST.
export async function GET(request: NextRequest) {
  try {
    return await unsubscribeByToken(request.nextUrl.searchParams.get('token'));
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    return await unsubscribeByToken(token);
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
