import { NextRequest, NextResponse } from 'next/server';
import { getReport } from '@/lib/db';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const report = await getReport(id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error("Fetch Report Error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
