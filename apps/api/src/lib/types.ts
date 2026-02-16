import { log } from "db";
import { SessionType, UserType } from "db/types";
import type { Context } from "hono";

// Match the Variables shape declared in HonoBetterAuth
export type ApiContextVariables = {
	user: UserType;
	session: SessionType;
	teamId: string | null;
	requestId: string | null;
};
export type ApiContext = Context<{
	Variables: ApiContextVariables;
}>;

export type LoggingOptions = Omit<
	typeof log.$inferInsert,
	"id" | "occurredAt" | "logType" | "message"
>;
// Single type representing the logType value (e.g. "INFO" | "WARNING" | "ERROR")
export type LoggingType = (typeof log.$inferSelect)["logType"];
