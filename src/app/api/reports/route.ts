import { NextResponse } from 'next/server';
import { getAllReports } from '@/lib/db';

export async function GET() {
  try {
    const reports = await getAllReports();
    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Fetch All Reports Error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
