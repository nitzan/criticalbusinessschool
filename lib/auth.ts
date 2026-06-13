import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthPayload {
  userId: string;
  email: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthPayload | null> {
  try {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return null;
    }

    const payload = verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Resolves the authenticated user and verifies they have the INSTRUCTOR role.
 * Returns the user record on success, or null if unauthenticated / not allowed.
 */
export async function getInstructorUser(request: NextRequest) {
  const payload = await getAuthUser(request);
  if (!payload) {
    return null;
  }

  const user = await getUserById(payload.userId);
  if (!user || user.role !== 'INSTRUCTOR') {
    return null;
  }

  return user;
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  });
}
