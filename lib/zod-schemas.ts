import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const playerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  position: z.enum(['GK', 'DF', 'MF', 'FW']),
  shirtNo: z.number().int().positive().optional().nullable(),
  dob: z.date().optional().nullable(),
  heightCm: z.number().int().positive().optional().nullable(),
  weightKg: z.number().int().positive().optional().nullable(),
  status: z.enum(['ACTIVE', 'INJURED', 'SUSPENDED', 'RESTING']),
});

export const matchSchema = z.object({
  opponent: z.string().min(1, 'Opponent is required'),
  date: z.date(),
  venue: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
});

export const playerMatchStatSchema = z.object({
  playerId: z.number().int().positive(),
  matchId: z.number().int().positive(),
  minutes: z.number().int().min(0).max(120).default(0),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  yellow: z.number().int().min(0).max(2).default(0),
  red: z.number().int().min(0).max(1).default(0),
});

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'STAFF']),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PlayerInput = z.infer<typeof playerSchema>;
export type MatchInput = z.infer<typeof matchSchema>;
export type PlayerMatchStatInput = z.infer<typeof playerMatchStatSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;




