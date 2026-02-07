import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);

    if (!authPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserById(authPayload.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
