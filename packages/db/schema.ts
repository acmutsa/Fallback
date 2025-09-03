import { sql, relations } from "drizzle-orm";
import {
  integer,
  text,
  blob,
  sqliteTable,
  customType,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

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

function standardIdFactory() {
  return text("id").notNull();
}

const logType = text({enum:['INFO',"WARNING","ERROR"]});
const invocationType = text({enum:["MANUAL","CRON"]});
const databaseType = text({enum:["SQLITE", "POSTGRESQL"]});
const backupResult = text({enum:["SUCCESS", "FAILURE", "CANCELED"]});
const roleType = text({enum:["ADMIN", "USER"]});

// TODO: COME BACK AND ADD RELATIONS AND REFERENCES
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  firstName: text("first_name", { length: 255 }).notNull(),
  lastName: text("last_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  pronouns: text("pronouns", { length: 255 }),
  createdAt:standardDateFactory(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  lastSeen: standardDateFactory(),
  // role: t
  //   .text("role", { enum: ["admin", "user"] })
  //   .notNull()
  //   .default("user"),
});

export const team = sqliteTable("team", {
  id: standardIdFactory().primaryKey(),
  name: standardVarcharFactory(),
  createdAt: standardDateFactory(),
  updatedAt: standardDateFactory(),
  isprivate: integer({ mode: "boolean" }).notNull().default(true),
});


export const userToTeam = sqliteTable("user_to_team", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  teamId: text("team_id").notNull().references(() => team.id, { onDelete: "cascade" }),
  role: roleType.notNull().default("USER")
});

export const backupJob = sqliteTable("backup_job",{
  id: standardIdFactory().primaryKey(),
  
});










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