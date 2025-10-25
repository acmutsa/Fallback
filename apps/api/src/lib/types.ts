import { auth } from "../lib/auth";

export type UserType = typeof auth.$Infer.Session.user | undefined;
export type SessionType = typeof auth.$Infer.Session.session | undefined;
