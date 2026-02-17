import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { playerSchema } from '@/lib/zod-schemas';
import { Position } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const position = searchParams.get('position') as Position | null;
    const sort = searchParams.get('sort') || 'lastName';
    const dir = searchParams.get('dir') || 'asc';
    const seasonName = searchParams.get('season') || '';

    // Get season ID
    let seasonId: number | null = null;
    if (seasonName) {
      const season = await prisma.season.findUnique({
        where: { name: seasonName },
      });
      seasonId = season?.id || -1; // -1 to return no stats if requested season not found
    } else {
      // Default to current season
      const currentSeason = await prisma.season.findFirst({
        where: { isCurrent: true },
      });
      seasonId = currentSeason?.id || -1; // -1 to return no stats if no current season
    }

    const where: any = {};
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { position: { contains: q, mode: 'insensitive' } },
        { shirtNo: isNaN(Number(q)) ? undefined : Number(q) },
      ].filter(Boolean);
    }
    if (position) {
      where.position = position;
    }

    const orderBy: any = {};
    if (sort === 'goals' || sort === 'assists' || sort === 'minutes') {
      // For aggregated stats, we'll need to join or calculate separately
      // For now, just sort by name
      orderBy.lastName = dir;
    } else {
      orderBy[sort] = dir;
    }

    const statsWhere = seasonId ? { seasonId } : {};

    const players = await prisma.player.findMany({
      where,
      orderBy,
      include: {
        stats: {
          where: statsWhere,
          select: {
            goals: true,
            assists: true,
            minutes: true,
            tackles: true,
            blocks: true,
            saves: true,
            rating: true,
          },
        },
      },
    });

    // Calculate totals for each player
    const playersWithStats = players.map((player) => {
      const totals = player.stats.reduce(
        (acc, stat) => ({
          goals: acc.goals + stat.goals,
          assists: acc.assists + stat.assists,
          minutes: acc.minutes + stat.minutes,
          tackles: acc.tackles + (stat.tackles || 0),
          blocks: acc.blocks + (stat.blocks || 0),
          saves: acc.saves + (stat.saves || 0),
          ratings: acc.ratings + (stat.rating || 0),
          matchCount: acc.matchCount + 1,
        }),
        { goals: 0, assists: 0, minutes: 0, tackles: 0, blocks: 0, saves: 0, ratings: 0, matchCount: 0 }
      );

      // Calculate match started (matches where stats exist)
      const matchesStarted = player.stats.length;

      // Calculate average rating
      const avgRating = totals.matchCount > 0 && totals.ratings > 0
        ? totals.ratings / totals.matchCount
        : null;

      return {
        ...player,
        totalGoals: totals.goals,
        totalAssists: totals.assists,
        totalMinutes: totals.minutes,
        totalTackles: totals.tackles,
        totalBlocks: totals.blocks,
        totalSaves: totals.saves,
        totalPlayers: 1, // Each player entry represents one player
        matchesStarted,
        avgRating,
      };
    });

    // Sort by stats if needed
    if (sort === 'goals' || sort === 'assists' || sort === 'minutes' ||
      sort === 'tackles' || sort === 'blocks' || sort === 'saves' ||
      sort === 'matchesStarted' || sort === 'avgRating') {
      playersWithStats.sort((a, b) => {
        let aVal: number | null = 0;
        let bVal: number | null = 0;

        if (sort === 'goals') {
          aVal = a.totalGoals;
          bVal = b.totalGoals;
        } else if (sort === 'assists') {
          aVal = a.totalAssists;
          bVal = b.totalAssists;
        } else if (sort === 'minutes') {
          aVal = a.totalMinutes;
          bVal = b.totalMinutes;
        } else if (sort === 'tackles') {
          aVal = a.totalTackles;
          bVal = b.totalTackles;
        } else if (sort === 'blocks') {
          aVal = a.totalBlocks;
          bVal = b.totalBlocks;
        } else if (sort === 'saves') {
          aVal = a.totalSaves;
          bVal = b.totalSaves;
        } else if (sort === 'matchesStarted') {
          aVal = a.matchesStarted;
          bVal = b.matchesStarted;
        } else if (sort === 'avgRating') {
          aVal = a.avgRating ?? 0;
          bVal = b.avgRating ?? 0;
        }

        return dir === 'asc' ? (aVal ?? 0) - (bVal ?? 0) : (bVal ?? 0) - (aVal ?? 0);
      });
    }

    return NextResponse.json(playersWithStats);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = playerSchema.parse(body);

    const player = await prisma.player.create({ data: validated });

    return NextResponse.json(player, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




