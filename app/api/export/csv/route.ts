import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getReportData } from '@/app/actions/stats';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filters: { startDate?: Date; endDate?: Date } = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const reportData = await getReportData(filters);

    if (!reportData) {
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }

    // Build CSV
    const headers = ['Player Name', 'Position', 'Matches', 'Minutes', 'Goals', 'Assists', 'Yellow Cards', 'Red Cards'];
    const rows = reportData.map((player) => [
      player.playerName,
      player.position,
      player.matches.toString(),
      player.minutes.toString(),
      player.goals.toString(),
      player.assists.toString(),
      player.yellow.toString(),
      player.red.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="player-stats-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




