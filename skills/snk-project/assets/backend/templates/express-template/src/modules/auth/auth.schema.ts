import { z } from 'zod';
import { emailField, nameField, passwordField } from '../users/user.schema.js';

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

// Login does not enforce password rules, so wrong passwords get INVALID_CREDENTIALS, not 400.
export const loginSchema = z.object({ email: emailField, password: z.string().min(1) });
