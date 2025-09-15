PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_backup_job` (
	`id` text PRIMARY KEY DEFAULT 'job_vWupaPoP_lm2b3OUjgm_N' NOT NULL,
	`name` text(255) NOT NULL,
	`authentication_data` blob NOT NULL,
	`databaseType` text NOT NULL,
	`cronString` text(255) NOT NULL,
	`team_id` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_backup_job`("id", "name", "authentication_data", "databaseType", "cronString", "team_id") SELECT "id", "name", "authentication_data", "databaseType", "cronString", "team_id" FROM `backup_job`;--> statement-breakpoint
DROP TABLE `backup_job`;--> statement-breakpoint
ALTER TABLE `__new_backup_job` RENAME TO `backup_job`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_backup_job_run` (
	`id` text PRIMARY KEY DEFAULT 'OEscBwrDXIOeqyEQFogfd' NOT NULL,
	`invocationType` text NOT NULL,
	`backup_job_id` text NOT NULL,
	`startedAt` integer DEFAULT (current_timestamp) NOT NULL,
	`completedAt` integer,
	`result` text,
	FOREIGN KEY (`backup_job_id`) REFERENCES `backup_job`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_backup_job_run`("id", "invocationType", "backup_job_id", "startedAt", "completedAt", "result") SELECT "id", "invocationType", "backup_job_id", "startedAt", "completedAt", "result" FROM `backup_job_run`;--> statement-breakpoint
DROP TABLE `backup_job_run`;--> statement-breakpoint
ALTER TABLE `__new_backup_job_run` RENAME TO `backup_job_run`;--> statement-breakpoint
CREATE TABLE `__new_log` (
	`id` text PRIMARY KEY DEFAULT 'HOxRMqecJIc5bbz4avVbS' NOT NULL,
	`logType` text NOT NULL,
	`message` text(255) NOT NULL,
	`occurredAt` integer DEFAULT (current_timestamp) NOT NULL,
	`team_id` text
);
--> statement-breakpoint
INSERT INTO `__new_log`("id", "logType", "message", "occurredAt", "team_id") SELECT "id", "logType", "message", "occurredAt", "team_id" FROM `log`;--> statement-breakpoint
DROP TABLE `log`;--> statement-breakpoint
ALTER TABLE `__new_log` RENAME TO `log`;--> statement-breakpoint
CREATE TABLE `__new_team` (
	`id` text PRIMARY KEY DEFAULT 'team_bV4cUqNKMb5V_ERTpSY0H' NOT NULL,
	`name` text(255) NOT NULL,
	`createdAt` integer DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` integer DEFAULT (current_timestamp) NOT NULL,
	`isprivate` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_team`("id", "name", "createdAt", "updatedAt", "isprivate") SELECT "id", "name", "createdAt", "updatedAt", "isprivate" FROM `team`;--> statement-breakpoint
DROP TABLE `team`;--> statement-breakpoint
ALTER TABLE `__new_team` RENAME TO `team`;--> statement-breakpoint
CREATE TABLE `__new_team_invite` (
	`id` text PRIMARY KEY DEFAULT 'invite_VpbVO2_d8L-hYmEakecti' NOT NULL,
	`team_id` text NOT NULL,
	`email` text NOT NULL,
	`createdAt` integer DEFAULT (current_timestamp) NOT NULL,
	`expiresAt` integer NOT NULL,
	`acceptedAt` integer,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_team_invite`("id", "team_id", "email", "createdAt", "expiresAt", "acceptedAt") SELECT "id", "team_id", "email", "createdAt", "expiresAt", "acceptedAt" FROM `team_invite`;--> statement-breakpoint
DROP TABLE `team_invite`;--> statement-breakpoint
ALTER TABLE `__new_team_invite` RENAME TO `team_invite`;--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `user_to_team` ALTER COLUMN "role" TO "role" text NOT NULL DEFAULT 'MEMBER';--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);