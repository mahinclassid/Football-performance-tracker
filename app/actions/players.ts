'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { playerSchema, type PlayerInput } from '@/lib/zod-schemas';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

export type ActionResult<T = void> = {
  ok: boolean;
  message?: string;
  data?: T;
};

export async function createPlayer(data: PlayerInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { ok: false, message: 'Unauthorized' };
    }

    const validated = playerSchema.parse(data);
    await prisma.player.create({ data: validated });

    revalidatePath('/players');
    return { ok: true, message: 'Player created successfully' };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { ok: false, message: error.errors[0].message };
    }
    return { ok: false, message: 'Failed to create player' };
  }
}

export async function updatePlayer(
  id: number,
  data: PlayerInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { ok: false, message: 'Unauthorized' };
    }

    const validated = playerSchema.parse(data);
    await prisma.player.update({
      where: { id },
      data: validated,
    });

    revalidatePath('/players');
    revalidatePath(`/players/${id}`);
    return { ok: true, message: 'Player updated successfully' };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { ok: false, message: error.errors[0].message };
    }
    return { ok: false, message: 'Failed to update player' };
  }
}

export async function deletePlayer(id: number): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { ok: false, message: 'Unauthorized. Admin access required.' };
    }

    await prisma.player.delete({ where: { id } });

    revalidatePath('/players');
    return { ok: true, message: 'Player deleted successfully' };
  } catch (error) {
    return { ok: false, message: 'Failed to delete player' };
  }
}

export async function getPlayer(id: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    return await prisma.player.findUnique({
      where: { id },
      include: {
        stats: {
          include: {
            match: true,
          },
          orderBy: {
            match: {
              date: 'desc',
            },
          },
        },
      },
    });
  } catch (error) {
    return null;
  }
}




