import { NextResponse } from 'next/server';
import { getEngineStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getEngineStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch AI model status' },
      { status: 500 }
    );
  }
}
