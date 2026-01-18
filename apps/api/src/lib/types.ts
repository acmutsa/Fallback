import { user, session, log } from "db";
import { Context } from "hono";

export type UserType = typeof user.$inferSelect | null;
export type SessionType = typeof session.$inferSelect | null;
// Match the Variables shape declared in HonoBetterAuth
export type ApiContext = {
			user: UserType;
			session: SessionType;
			teamId:string | null;
		};

export type LoggingOptions = Omit<typeof log.$inferInsert, "id" | "occurredAt" | "logType" | "message">;
export type LoggingType = Pick<typeof log.$inferSelect, "logType">;
 
