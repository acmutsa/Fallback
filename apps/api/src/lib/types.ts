import { log } from "db";
import type { SessionType, UserType } from "db/types";
import type { Context as HonoContext } from "hono";
import { LambdaContext } from "hono/aws-lambda";

// Match the Variables shape declared in HonoBetterAuth
export type ApiContextVariables = {
	user: UserType;
	session: SessionType;
	teamId: string | null;
	requestId: string | null;
};
export type ApiContext = HonoContext<{
	Variables: ApiContextVariables;
}>;

export type LoggingOptions = Omit<
	typeof log.$inferInsert,
	"id" | "occurredAt" | "logType" | "message" | "source"
>;
// Single type representing the logType value (e.g. "INFO" | "WARNING" | "ERROR")
export type LoggingType = (typeof log.$inferSelect)["logType"];

export type LoggingSource = (typeof log.$inferSelect)["source"];

export type FallbackContext = {honoContext?: HonoContext; lambdaContext?: LambdaContext };
