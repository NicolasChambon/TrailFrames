import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/\d/)
    .regex(/[@$!%*?&]/),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const authCookiesSchema = z.object({
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

export type AuthCookies = z.infer<typeof authCookiesSchema>;
