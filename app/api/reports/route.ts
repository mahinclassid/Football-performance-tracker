import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getReportData, getTeamReportData } from '@/app/actions/stats';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type') || 'player'; // 'player' or 'team'

    const filters: { startDate?: Date; endDate?: Date } = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    if (reportType === 'team') {
      const teamReportData = await getTeamReportData(filters);
      return NextResponse.json(teamReportData);
    } else {
      const reportData = await getReportData(filters);
      return NextResponse.json(reportData);
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




