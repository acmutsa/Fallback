import { user, session, log } from "db";

export type UserType = typeof user.$inferSelect | undefined;
export type SessionType = typeof session.$inferSelect | undefined;
export type LoggingOptions = Omit<typeof log.$inferInsert, "id" | "occurredAt" | "logType" | "message">;
export type LoggingType = Pick<typeof log.$inferSelect, "logType">;
 
