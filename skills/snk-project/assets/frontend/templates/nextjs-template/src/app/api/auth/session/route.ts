import { NextResponse } from 'next/server';
import { getServerSession } from '@/features/auth/server/session';
import { createErrorResponse, getRequestCookieHeader } from '@/server/bff';

/** 查询当前会话，只返回 user。 */
export async function GET(request: Request) {
  const session = await getServerSession(getRequestCookieHeader(request));

  if (!session) {
    return createErrorResponse(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  return NextResponse.json({ code: 0, message: 'success', data: { user: session.user } });
}
