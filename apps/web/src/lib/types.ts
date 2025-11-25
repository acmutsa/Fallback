import z from "zod";
import { emailSignUpSchema, emailSignInSchema } from "./zod";
import { QueryClient } from "@tanstack/react-query";
import { getSession } from "@/lib/functions/auth";

export type EmailSignUpType = z.infer<typeof emailSignUpSchema>;
export type EmailSignInType = z.infer<typeof emailSignInSchema>;
export type RouterContext = {
	queryClient: QueryClient;
	auth?: Awaited<ReturnType<typeof getSession>>;
};