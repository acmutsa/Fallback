import z from "zod";
import { AUTH_CONFIG } from "shared/constants";

const basicStringSchema = z.string().min(1).max(50);

export const emailSignUpSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(AUTH_CONFIG.emailAndPassword.minPasswordLength)
		.max(AUTH_CONFIG.emailAndPassword.maxPasswordLength),
	name: basicStringSchema,
	redirectUrl: z.string().url().optional(),
});

export const emailSignInSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(AUTH_CONFIG.emailAndPassword.minPasswordLength)
		.max(AUTH_CONFIG.emailAndPassword.maxPasswordLength),
	redirectUrl: z.string().url().optional(),
});
