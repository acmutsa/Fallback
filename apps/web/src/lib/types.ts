import  z  from "zod";
import { emailSignUpSchema, emailSignInSchema } from "./zod";

export type EmailSignUpType = z.infer<typeof emailSignUpSchema>;
export type EmailSignInType = z.infer<typeof emailSignInSchema>;