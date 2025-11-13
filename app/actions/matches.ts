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
    const validatedStats = stats.map((stat) => playerMatchStatSchema.parse(stat));

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
            minutes: stat.minutes,
            goals: stat.goals,
            assists: stat.assists,
            yellow: stat.yellow,
            red: stat.red,
          },
          create: stat,
        })
      )
    );

    revalidatePath('/matches');
    revalidatePath('/dashboard');
    return { ok: true, message: 'Statistics saved successfully' };
  } catch (error: any) {
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




