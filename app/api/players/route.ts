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

    const where: any = {};
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ];
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

    const players = await prisma.player.findMany({
      where,
      orderBy,
      include: {
        stats: {
          select: {
            goals: true,
            assists: true,
            minutes: true,
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
        }),
        { goals: 0, assists: 0, minutes: 0 }
      );

      return {
        ...player,
        totalGoals: totals.goals,
        totalAssists: totals.assists,
        totalMinutes: totals.minutes,
      };
    });

    // Sort by stats if needed
    if (sort === 'goals' || sort === 'assists' || sort === 'minutes') {
      playersWithStats.sort((a, b) => {
        const aVal = a[`total${sort.charAt(0).toUpperCase() + sort.slice(1)}` as keyof typeof a] as number;
        const bVal = b[`total${sort.charAt(0).toUpperCase() + sort.slice(1)}` as keyof typeof b] as number;
        return dir === 'asc' ? aVal - bVal : bVal - aVal;
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




