import { z } from 'zod';

export const ROLES = ['user', 'admin'] as const;

export const emailField = z.string().trim().toLowerCase().email().max(255);
export const nameField = z.string().trim().min(2).max(50);
export const passwordField = z.string().min(8).max(72);

export const idParamsSchema = z.object({ id: z.string().uuid() });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: z.enum(ROLES).default('user'),
});

export const updateUserSchema = z
  .object({ name: nameField, email: emailField, role: z.enum(ROLES) })
  .partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
