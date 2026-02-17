'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { matchSchema, playerMatchStatSchema, type MatchInput, type PlayerMatchStatInput } from '@/lib/zod-schemas';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import type { ActionResult } from './players';

export type { ActionResult };

export async function createMatch(data: MatchInput): Promise<ActionResult<{ id: number }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { ok: false, message: 'Unauthorized' };
    }

    const validated = matchSchema.parse(data);
    
    const match = await prisma.match.create({ data: validated });

    revalidatePath('/matches');
    return { ok: true, message: 'Match created successfully', data: { id: match.id } };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { ok: false, message: error.errors[0].message };
    }
    return { ok: false, message: 'Failed to create match' };
  }
}

export async function updateMatch(
  id: number,
  data: MatchInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { ok: false, message: 'Unauthorized' };
    }

    const validated = matchSchema.parse(data);
    
    await prisma.match.update({
      where: { id },
      data: validated,
    });

    revalidatePath('/matches');
    revalidatePath(`/matches/${id}`);
    return { ok: true, message: 'Match updated successfully' };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { ok: false, message: error.errors[0].message };
    }
    return { ok: false, message: 'Failed to update match' };
  }
}

export async function deleteMatch(id: number): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { ok: false, message: 'Unauthorized. Admin access required.' };
    }

    await prisma.match.delete({ where: { id } });

    revalidatePath('/matches');
    return { ok: true, message: 'Match deleted successfully' };
  } catch (error) {
    return { ok: false, message: 'Failed to delete match' };
  }
}

export async function upsertPlayerMatchStat(
  stats: PlayerMatchStatInput[]
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { ok: false, message: 'Unauthorized' };
    }

    // Validate all stats
    const validatedStats = stats.map((stat) => {
      try {
        return playerMatchStatSchema.parse(stat);
      } catch (parseError) {
        console.error('Validation error for stat:', stat, parseError);
        throw parseError;
      }
    });

    if (validatedStats.length === 0) {
      return { ok: false, message: 'No statistics to save' };
    }

    // Get the first match to fetch seasonId
    const firstStat = validatedStats[0];
    const match = await prisma.match.findUnique({
      where: { id: firstStat.matchId },
      select: { seasonId: true },
    });

    if (!match) {
      return { ok: false, message: 'Match not found' };
    }

    // Use transaction for batch operation
    await prisma.$transaction(
      validatedStats.map((stat) =>
        prisma.playerMatchStat.upsert({
          where: {
            playerId_matchId: {
              playerId: stat.playerId,
              matchId: stat.matchId,
            },
          },
          update: {
            started: stat.started,
            substituted: stat.substituted,
            minutes: stat.minutes,
            goals: stat.goals,
            assists: stat.assists,
            yellow: stat.yellow,
            red: stat.red,
            tackles: stat.tackles,
            blocks: stat.blocks,
            saves: stat.saves,
            rating: stat.rating,
          },
          create: {
            ...stat,
            seasonId: match.seasonId,
          },
        })
      )
    );

    revalidatePath('/matches');
    revalidatePath('/dashboard');
    return { ok: true, message: 'Statistics saved successfully' };
  } catch (error: any) {
    console.error('Error saving statistics:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      errors: error?.errors,
    });
    if (error.code === 'P2002') {
      return { ok: false, message: 'Duplicate stat entry' };
    }
    if (error.name === 'ZodError') {
      return { ok: false, message: error.errors[0].message };
    }
    return { ok: false, message: 'Failed to save statistics' };
  }
}

export async function getMatch(id: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    return await prisma.match.findUnique({
      where: { id },
      include: {
        stats: {
          include: {
            player: true,
          },
        },
      },
    });
  } catch (error) {
    return null;
  }
}




