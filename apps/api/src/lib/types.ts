import { api } from "..";
import { auth } from "../lib/auth"

export type UserType = typeof auth.$Infer.Session.user | null;
export type SessionType = typeof auth.$Infer.Session.session | null;
