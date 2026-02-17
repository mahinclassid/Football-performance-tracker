'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const seasonSchema = z.object({
  name: z.string().regex(/^\d{2}-\d{2}$/, 'Season must be in format: 24-25'),
  isActive: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
});

export interface ActionResult<T = any> {
  ok: boolean;
  message: string;
  data?: T;
}

export async function createSeason(
  data: z.infer<typeof seasonSchema>
): Promise<ActionResult<{ id: number }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        ok: false,
        message: 'Unauthorized. Only admins can create seasons.',
      };
    }

    const validated = seasonSchema.parse(data);

    // Check if season already exists
    const existing = await prisma.season.findUnique({
      where: { name: validated.name },
    });

    if (existing) {
      return {
        ok: false,
        message: `Season ${validated.name} already exists.`,
      };
    }

    // If marking as current, unmark other seasons
    if (validated.isCurrent) {
      await prisma.season.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const season = await prisma.season.create({
      data: {
        name: validated.name,
        isActive: validated.isActive || false,
        isCurrent: validated.isCurrent || false,
      },
    });

    return {
      ok: true,
      message: `Season ${validated.name} created successfully.`,
      data: { id: season.id },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message || 'Invalid input',
      };
    }
    console.error('Error creating season:', error);
    return {
      ok: false,
      message: 'Failed to create season. Please try again.',
    };
  }
}

export async function deleteSeason(name: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        ok: false,
        message: 'Unauthorized. Only admins can delete seasons.',
      };
    }

    if (!name) {
      return {
        ok: false,
        message: 'Season name is required.',
      };
    }

    const season = await prisma.season.findUnique({
      where: { name },
    });

    if (!season) {
      return {
        ok: false,
        message: `Season ${name} not found.`,
      };
    }

    await prisma.season.delete({
      where: { id: season.id },
    });

    return {
      ok: true,
      message: `Season ${name} deleted successfully.`,
    };
  } catch (error: any) {
    console.error('Error deleting season:', error);
    return {
      ok: false,
      message: 'Failed to delete season. It may have associated data that prevents deletion.',
    };
  }
}
