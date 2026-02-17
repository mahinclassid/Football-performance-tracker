import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get season from query params (defaults to current season)
    const searchParams = request.nextUrl.searchParams;
    const seasonParam = searchParams.get('season');

    let seasonId: number | null = null;
    if (seasonParam) {
      const season = await prisma.season.findUnique({
        where: { name: seasonParam },
      });
      seasonId = season?.id || -1;
    } else {
      const currentSeason = await prisma.season.findFirst({
        where: { isCurrent: true },
      });
      seasonId = currentSeason?.id || -1;
    }

    // Get player data
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get player stats for the season
    const stats = await prisma.playerMatchStat.findMany({
      where: {
        playerId: playerId,
        ...(seasonId && { seasonId }),
      },
      include: {
        match: {
          select: {
            id: true,
            date: true,
            opponent: true,
            venue: true,
            result: true,
          },
        },
      },
      orderBy: {
        match: {
          date: 'asc',
        },
      },
    });

    // Get club info
    const club = await prisma.club.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals and averages
    const totals = stats.reduce(
      (acc, stat) => ({
        matches: acc.matches + 1,
        matchesStarted: acc.matchesStarted + (stat.started ? 1 : 0),
        goals: acc.goals + stat.goals,
        assists: acc.assists + stat.assists,
        minutes: acc.minutes + stat.minutes,
        tackles: acc.tackles + (stat.tackles || 0),
        blocks: acc.blocks + (stat.blocks || 0),
        saves: acc.saves + (stat.saves || 0),
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
        ratings: [] as number[],
      }
    );

    const avgRating = totals.ratings.length > 0
      ? totals.ratings.reduce((sum, r) => sum + r, 0) / totals.ratings.length
      : null;

    return NextResponse.json({
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
        shirtNo: player.shirtNo,
        dob: player.dob,
        heightCm: player.heightCm,
        weightKg: player.weightKg,
        status: player.status,
      },
      club: club || null,
      stats: {
        matches: totals.matches,
        matchesStarted: totals.matchesStarted,
        goals: totals.goals,
        assists: totals.assists,
        minutes: totals.minutes,
        tackles: totals.tackles,
        blocks: totals.blocks,
        saves: totals.saves,
        avgRating: avgRating,
      },
      matchHistory: stats.map(stat => ({
        date: stat.match.date,
        opponent: stat.match.opponent,
        venue: stat.match.venue,
        result: stat.match.result,
        started: stat.started,
        minutes: stat.minutes,
        goals: stat.goals,
        assists: stat.assists,
        tackles: stat.tackles,
        blocks: stat.blocks,
        saves: stat.saves,
        rating: stat.rating,
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching player report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player report' },
      { status: 500 }
    );
  }
}
