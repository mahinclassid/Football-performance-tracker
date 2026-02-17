import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPlayerStats } from '@/app/actions/stats';
import { getPlayer } from '@/app/actions/players';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const playerId = parseInt(id);

    if (isNaN(playerId)) {
      return NextResponse.json({ error: 'Invalid player ID' }, { status: 400 });
    }

    const player = await getPlayer(playerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const statsData = await getPlayerStats(playerId);
    if (!statsData || !statsData.stats || statsData.stats.length === 0) {
      return NextResponse.json({ error: 'No statistics available for this player' }, { status: 404 });
    }

    // Calculate totals including all fields
    const totals = statsData.stats.reduce(
      (acc, stat) => ({
        matches: acc.matches + 1,
        matchesStarted: acc.matchesStarted + (stat.started ? 1 : 0),
        goals: acc.goals + stat.goals,
        assists: acc.assists + stat.assists,
        minutes: acc.minutes + stat.minutes,
        tackles: acc.tackles + (stat.tackles || 0),
        blocks: acc.blocks + (stat.blocks || 0),
        saves: acc.saves + (stat.saves || 0),
        yellow: acc.yellow + stat.yellow,
        red: acc.red + stat.red,
        ratings: stat.rating !== null && stat.rating !== undefined 
          ? [...acc.ratings, stat.rating] 
          : acc.ratings,
      }),
      { 
        matches: 0, 
        matchesStarted: 0,
        goals: 0, 
        assists: 0, 
        minutes: 0, 
        tackles: 0,
        blocks: 0,
        saves: 0,
        yellow: 0, 
        red: 0,
        ratings: [] as number[],
      }
    );

    const avgRating = totals.ratings.length > 0
      ? totals.ratings.reduce((sum, r) => sum + r, 0) / totals.ratings.length
      : null;

    // Build CSV
    const playerName = `${player.firstName} ${player.lastName}`;
    const fileName = `${playerName.replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}.csv`;

    // Summary section
    const summaryHeaders = ['Statistic', 'Value'];
    const summaryRows = [
      ['Player Name', playerName],
      ['Position', player.position],
      ['Total Matches', totals.matches.toString()],
      ['Matches Started', totals.matchesStarted.toString()],
      ['Total Minutes', totals.minutes.toString()],
      ['Total Goals', totals.goals.toString()],
      ['Total Assists', totals.assists.toString()],
      ['Total Tackles', player.position === 'GK' ? 'N/A' : totals.tackles.toString()],
      ['Total Blocks', player.position === 'GK' ? 'N/A' : totals.blocks.toString()],
      ['Total Saves', player.position === 'GK' ? totals.saves.toString() : 'N/A'],
      ['Average Rating', avgRating !== null ? avgRating.toFixed(2) : 'N/A'],
      ['Yellow Cards', totals.yellow.toString()],
      ['Red Cards', totals.red.toString()],
    ];

    // Match-by-match statistics
    const matchHeaders = [
      'Date',
      'Opponent',
      'Started',
      'Minutes',
      'Goals',
      'Assists',
      'Tackles',
      'Blocks',
      'Saves',
      'Rating',
      'Yellow Cards',
      'Red Cards',
    ];

    const matchRows = statsData.stats.map((stat) => [
      stat.match.date.toISOString().split('T')[0],
      stat.match.opponent,
      stat.started ? 'Yes' : 'No',
      stat.minutes.toString(),
      stat.goals.toString(),
      stat.assists.toString(),
      player.position === 'GK' ? 'N/A' : (stat.tackles?.toString() || '0'),
      player.position === 'GK' ? 'N/A' : (stat.blocks?.toString() || '0'),
      player.position === 'GK' ? (stat.saves?.toString() || '0') : 'N/A',
      stat.rating !== null && stat.rating !== undefined ? stat.rating.toFixed(1) : '-',
      stat.yellow.toString(),
      stat.red.toString(),
    ]);

    // Combine summary and match data
    const csvContent = [
      'PLAYER STATISTICS REPORT',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'SUMMARY',
      summaryHeaders.join(','),
      ...summaryRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      '',
      'MATCH-BY-MATCH STATISTICS',
      matchHeaders.join(','),
      ...matchRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating player CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


