import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { matchSchema } from '@/lib/zod-schemas';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get season from query params
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season');

    let seasonId: number | null = null;
    if (seasonName) {
      const season = await prisma.season.findUnique({
        where: { name: seasonName },
      });
      seasonId = season?.id || -1;
    } else {
      // Default to current season
      const currentSeason = await prisma.season.findFirst({
        where: { isCurrent: true },
      });
      seasonId = currentSeason?.id || -1;
    }

    const seasonWhere = { seasonId };

    const matches = await prisma.match.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        stats: {
          include: {
            player: true,
          },
        },
      },
      where: seasonWhere,
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.error('Create match error: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Create match request body:', body);
    let validated;
    try {
      validated = matchSchema.parse(body);
    } catch (zodError: any) {
      console.error('Create match Zod validation error:', zodError.errors);
      return NextResponse.json({ error: zodError.errors?.[0]?.message || 'Validation error' }, { status: 400 });
    }

    try {
      const match = await prisma.match.create({ data: validated });
      return NextResponse.json(match, { status: 201 });
    } catch (prismaError: any) {
      console.error('Create match Prisma error:', prismaError);
      return NextResponse.json({ error: prismaError.message || 'Database error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Create match unknown error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}




