import { sql, relations } from "drizzle-orm";
import {
	integer,
	text,
	sqliteTable,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import {STANDARD_NANOID_SIZE} from "shared/constants";

const STANDARD_VARCHAR_LENGTH = 255;

function standardVarcharFactory() {
	return text({
		length: STANDARD_VARCHAR_LENGTH,
	}).notNull();
}

function standardDateFactory() {
	return integer({ mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`);
}

function standardIdFactory(prefix?: string) {
	return text("id")
		.notNull()
		.$defaultFn(() => `${prefix ?? ""}${nanoid(STANDARD_NANOID_SIZE)}`);
}

const logType = text({ enum: ["INFO", "WARNING", "ERROR"] });
const invocationType = text({ enum: ["MANUAL", "CRON"] });
const databaseType = text({ enum: ["SQLITE", "POSTGRESQL"] });
const backupResult = text({ enum: ["SUCCESS", "FAILURE", "CANCELED"] });
const memberRoleType = text({ enum: ["ADMIN", "MEMBER"] });
const siteRoleType = text({ enum: ["SUPER_ADMIN", "ADMIN", "USER"] });

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	firstName: text("first_name", { length: 255 }).notNull(),
	lastName: text("last_name", { length: 255 }).notNull(),
	email: text("email").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	lastSeen: standardDateFactory(),
	siteRole: siteRoleType.notNull().default("USER"),
});

export const userRelations = relations(user, ({ many }) => ({
	teams: many(userToTeam),
}));

export const team = sqliteTable("team", {
	id: standardIdFactory("team_").primaryKey(),
	name: standardVarcharFactory(),
	createdAt: standardDateFactory(),
	updatedAt: standardDateFactory(),
	isprivate: integer({ mode: "boolean" }).notNull().default(true),
});

export const teamRelations = relations(team, ({ many }) => ({
	members: many(userToTeam),
	invites: many(teamInvite),
	logs: many(log),
	backupJobs: many(backupJob),
}));

export const userToTeam = sqliteTable(
	"user_to_team",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		teamId: text("team_id")
			.notNull()
			.references(() => team.id, { onDelete: "cascade" }),
		role: memberRoleType.notNull().default("MEMBER"),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.teamId] }), // composite primary key
	],
);

export const userToTeamRelations = relations(userToTeam, ({ one }) => ({
	user: one(user, {
		fields: [userToTeam.userId],
		references: [user.id],
	}),
	team: one(team, {
		fields: [userToTeam.teamId],
		references: [team.id],
	}),
}));

export const teamInvite = sqliteTable("team_invite", {
	id: standardIdFactory("invite_").primaryKey(),
	teamId: text("team_id")
		.notNull()
		.references(() => team.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	createdAt: standardDateFactory(),
	expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
	acceptedAt: integer({ mode: "timestamp_ms" }),
});

export const teamInviteRelations = relations(teamInvite, ({ one }) => ({
	team: one(team, {
		fields: [teamInvite.teamId],
		references: [team.id],
	}),
}));

export const backupJob = sqliteTable("backup_job", {
	id: standardIdFactory("job_").primaryKey(),
	name: standardVarcharFactory(),
	authenticationData: text({ mode: "json" }).notNull(), //This type might need to be altered. We will see how nice it plays when we write our first data here.
	databaseType: databaseType.notNull(),
	cronString: standardVarcharFactory(),
	teamId: text("team_id")
		.notNull()
		.references(() => team.id, { onDelete: "cascade" }),
});

export const backupJobRelations = relations(backupJob, ({ one, many }) => ({
	team: one(team, {
		fields: [backupJob.teamId],
		references: [team.id],
	}),
	runs: many(backupJobRun),
}));

export const backupJobRun = sqliteTable("backup_job_run", {
	id: standardIdFactory().primaryKey(),
	invocationType: invocationType.notNull(),
	backupJobId: text("backup_job_id")
		.notNull()
		.references(() => backupJob.id, { onDelete: "cascade" }),
	startedAt: standardDateFactory(),
	completedAt: integer({ mode: "timestamp_ms" }),
	result: backupResult,
});

export const backupJobRunRelations = relations(backupJobRun, ({ one }) => ({
	backupJob: one(backupJob, {
		fields: [backupJobRun.backupJobId],
		references: [backupJob.id],
	}),
}));

export const log = sqliteTable("log", {
	id: standardIdFactory().primaryKey(),
	logType: logType.notNull(),
	message: standardVarcharFactory(),
	occurredAt: standardDateFactory(),
	teamId: text("team_id"),
});

export const logRelations = relations(log, ({ one }) => ({
	team: one(team, {
		fields: [log.teamId],
		references: [team.id],
	}),
}));

// Auth Tables - DO NOT MODIFY
export const session = sqliteTable("session", (t) => ({
	id: t.text("id").primaryKey(),
	expiresAt: t.integer("expires_at", { mode: "timestamp" }).notNull(),
	token: t.text("token").notNull().unique(),
	createdAt: t.integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: t.integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: t.text("ip_address"),
	userAgent: t.text("user_agent"),
	userId: t
		.text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
}));

export const account = sqliteTable("account", (t) => ({
	id: t.text("id").primaryKey(),
	accountId: t.text("account_id").notNull(),
	providerId: t.text("provider_id").notNull(),
	userId: t
		.text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: t.text("access_token"),
	refreshToken: t.text("refresh_token"),
	idToken: t.text("id_token"),
	accessTokenExpiresAt: t.integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: t.integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: t.text("scope"),
	password: t.text("password"),
	createdAt: t.integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: t.integer("updated_at", { mode: "timestamp" }).notNull(),
}));

export const verification = sqliteTable("verification", (t) => ({
	id: t.text("id").primaryKey(),
	identifier: t.text("identifier").notNull(),
	value: t.text("value").notNull(),
	expiresAt: t.integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: t.integer("created_at", { mode: "timestamp" }),
	updatedAt: t.integer("updated_at", { mode: "timestamp" }),
}));
