import { NextRequest, NextResponse } from 'next/server';
import { getInstructorUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

// Instructor-only: send a newsletter to all active subscribers.
export async function POST(
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
        { error: 'This newsletter has already been sent' },
        { status: 400 }
      );
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: 'SUBSCRIBED' },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'There are no active subscribers to send to' },
        { status: 400 }
      );
    }

    const baseUrl = request.nextUrl.origin;
    let sent = 0;
    let failed = 0;

    // Send sequentially and record a delivery row per subscriber.
    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${subscriber.token}`;
      const body =
        `${newsletter.content}\n\n` +
        `---\n` +
        `You are receiving this because you subscribed to the Critical Business newsletter.\n` +
        `Unsubscribe: ${unsubscribeUrl}`;

      const result = await sendMail({
        to: subscriber.email,
        subject: newsletter.subject,
        text: body,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      await prisma.newsletterDelivery.upsert({
        where: {
          newsletterId_subscriberId: {
            newsletterId: newsletter.id,
            subscriberId: subscriber.id,
          },
        },
        create: {
          newsletterId: newsletter.id,
          subscriberId: subscriber.id,
          status: result.success ? 'SENT' : 'FAILED',
          error: result.error || null,
          sentAt: result.success ? new Date() : null,
        },
        update: {
          status: result.success ? 'SENT' : 'FAILED',
          error: result.error || null,
          sentAt: result.success ? new Date() : null,
        },
      });
    }

    const updated = await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    return NextResponse.json(
      { message: 'Newsletter sent', newsletter: updated, sent, failed },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send newsletter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
