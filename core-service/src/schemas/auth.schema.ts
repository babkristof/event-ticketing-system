import { z } from 'zod';

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be at most 50 characters long'),
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must be at most 50 characters long')
});

export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must be at most 50 characters long')
});

export type SignUpData = z.infer<typeof SignUpSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
