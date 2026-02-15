import { user, session, log } from "./schema";

export type UserType = typeof user.$inferSelect | null;
export type SessionType = typeof session.$inferSelect | null;
export type SiteRoleType = typeof user.$inferSelect.siteRole;
export { LibsqlError as DatabaseError } from "@libsql/client/web";
