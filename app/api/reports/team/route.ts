import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const seasonParam = searchParams.get('season');

    if (!seasonParam) {
      return NextResponse.json({ error: 'Season parameter required' }, { status: 400 });
    }

    // Get season
    const season = await prisma.season.findUnique({
      where: { name: seasonParam },
    });

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    // Get club info
    const club = await prisma.club.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all matches for the season with their stats
    const matches = await prisma.match.findMany({
      where: {
        seasonId: season.id,
      },
      include: {
        stats: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate team totals
    let totalGoals = 0;
    let totalGoalsConceded = 0;
    let totalAssists = 0;
    let totalTackles = 0;
    let totalBlocks = 0;
    let totalSaves = 0;
    const allRatings: number[] = [];

    matches.forEach((match) => {
      // Sum up player stats for this match
      match.stats.forEach((stat) => {
        totalGoals += stat.goals;
        totalAssists += stat.assists;
        totalTackles += stat.tackles || 0;
        totalBlocks += stat.blocks || 0;
        totalSaves += stat.saves || 0;
        if (stat.rating !== null && stat.rating !== undefined) {
          allRatings.push(stat.rating);
        }
      });

      // Parse goals conceded from result string (format: "X-Y" where X is our goals, Y is opponent goals)
      if (match.result) {
        const matchResult = match.result.match(/^(\d+)-(\d+)$/);
        if (matchResult) {
          totalGoalsConceded += parseInt(matchResult[2], 10);
        }
      }
    });

    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : null;

    return NextResponse.json({
      season: {
        id: season.id,
        name: season.name,
      },
      club,
      matches: matches.map((match) => ({
        id: match.id,
        date: match.date,
        opponent: match.opponent,
        venue: match.venue,
        result: match.result,
        playersCount: match.stats.length,
      })),
      stats: {
        matchesPlayed: matches.length,
        totalGoals,
        totalGoalsConceded,
        totalAssists,
        totalTackles,
        totalBlocks,
        totalSaves,
        avgRating: avgRating ? Number(avgRating.toFixed(2)) : null,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching team report data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
