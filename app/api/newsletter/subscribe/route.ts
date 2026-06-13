import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public endpoint: anyone can subscribe to the newsletter.
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    // Re-subscribe a previously unsubscribed address, or create a new one.
    const subscriber = existing
      ? await prisma.newsletterSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            status: 'SUBSCRIBED',
            name: name?.trim() || existing.name,
          },
        })
      : await prisma.newsletterSubscriber.create({
          data: {
            email: normalizedEmail,
            name: name?.trim() || null,
          },
        });

    return NextResponse.json(
      {
        message: 'Subscribed successfully',
        // Token is returned so the client can build an unsubscribe link.
        token: subscriber.token,
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
