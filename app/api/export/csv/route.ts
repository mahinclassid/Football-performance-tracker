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
    const reportType = searchParams.get('type') || 'player';

    const filters: { startDate?: Date; endDate?: Date } = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    if (reportType === 'team') {
      const teamReportData = await getTeamReportData(filters);
      if (!teamReportData) {
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
      }

      // Build CSV for team report
      const headers = [
        'Matches Played',
        'Total Goals',
        'Goals Conceded',
        'Total Assists',
        'Total Tackles',
        'Total Blocks',
        'Total Saves (GK)',
        'Average Player Rating'
      ];
      const row = [
        (teamReportData.matchesPlayed || 0).toString(),
        (teamReportData.totalGoals || 0).toString(),
        (teamReportData.totalGoalsConceded || 0).toString(),
        (teamReportData.totalAssists || 0).toString(),
        (teamReportData.totalTackles || 0).toString(),
        (teamReportData.totalBlocks || 0).toString(),
        (teamReportData.totalSaves || 0).toString(),
        teamReportData.avgRating !== null && teamReportData.avgRating !== undefined 
          ? teamReportData.avgRating.toFixed(2) 
          : 'N/A',
      ];

      const csvContent = [
        headers.join(','),
        row.map((cell) => `"${cell}"`).join(','),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="team-stats-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      const reportData = await getReportData(filters);
      if (!reportData) {
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
      }

      // Build CSV for player report
      const headers = [
        'Player Name',
        'Position',
        'Matches',
        'Matches Started',
        'Minutes',
        'Goals',
        'Assists',
        'Tackles',
        'Blocks',
        'Saves',
        'Avg Rating',
        'Yellow Cards',
        'Red Cards'
      ];
      const rows = reportData.map((player) => [
        player.playerName,
        player.position,
        player.matches.toString(),
        (player.matchesStarted || 0).toString(),
        player.minutes.toString(),
        player.goals.toString(),
        player.assists.toString(),
        player.position === 'GK' ? 'N/A' : (player.tackles || 0).toString(),
        player.position === 'GK' ? 'N/A' : (player.blocks || 0).toString(),
        player.position === 'GK' ? (player.saves || 0).toString() : 'N/A',
        player.avgRating !== null && player.avgRating !== undefined ? player.avgRating.toFixed(2) : '-',
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
    }
  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




