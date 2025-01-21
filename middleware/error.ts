import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function errorHandler(error: Error) {
  console.error('Application error:', error);

  return new NextResponse(
    JSON.stringify({
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal Server Error',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function withErrorHandling(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  try {
    return await handler(req);
  } catch (error) {
    return errorHandler(error as Error);
  }
} 