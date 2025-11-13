'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { userSchema, updateUserSchema, type UserInput, type UpdateUserInput } from '@/lib/zod-schemas';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { ActionResult } from './players';

export async function createUser(data: UserInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { ok: false, message: 'Unauthorized. Admin access required.' };
    }

    const validated = userSchema.parse(data);
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    await prisma.user.create({
      data: {
        ...validated,
        password: hashedPassword,
      },
    });

    revalidatePath('/settings/users');
    return { ok: true, message: 'User created successfully' };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { ok: false, message: 'Email already exists' };
    }
    if (error.name === 'ZodError') {
      return { ok: false, message: error.errors[0].message };
    }
    return { ok: false, message: 'Failed to create user' };
  }
}

export async function updateUser(id: number, data: UpdateUserInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { ok: false, message: 'Unauthorized. Admin access required.' };
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/settings/users');
    return { ok: true, message: 'User updated successfully' };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { ok: false, message: 'Email already exists' };
    }
    if (error.name === 'ZodError') {
      return { ok: false, message: error.errors[0].message };
    }
    return { ok: false, message: 'Failed to update user' };
  }
}

export async function deleteUser(id: number): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { ok: false, message: 'Unauthorized. Admin access required.' };
    }

    // Prevent deleting yourself
    if (session.user.id === id.toString()) {
      return { ok: false, message: 'Cannot delete your own account' };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath('/settings/users');
    return { ok: true, message: 'User deleted successfully' };
  } catch (error) {
    return { ok: false, message: 'Failed to delete user' };
  }
}

export async function getAllUsers() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return null;
    }

    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    return null;
  }
}

export async function resetUserPassword(id: number, newPassword: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { ok: false, message: 'Unauthorized. Admin access required.' };
    }

    if (newPassword.length < 6) {
      return { ok: false, message: 'Password must be at least 6 characters' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    revalidatePath('/settings/users');
    return { ok: true, message: 'Password reset successfully' };
  } catch (error) {
    return { ok: false, message: 'Failed to reset password' };
  }
}




