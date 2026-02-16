import { user, session } from "./schema";

export type UserType = typeof user.$inferSelect | null;
export type SessionType = typeof session.$inferSelect | null;
export type SiteRoleType = typeof user.$inferSelect.siteRole;
