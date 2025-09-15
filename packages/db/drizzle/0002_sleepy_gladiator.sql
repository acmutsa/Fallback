ALTER TABLE `user` RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN "lastSeen" TO "last_seen";--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN "siteRole" TO "site_role";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_backup_job` (
	`id` text PRIMARY KEY DEFAULT 'job_nib5vIL9oPEtu7dNan2ul' NOT NULL,
	`name` text(255) NOT NULL,
	`authentication_data` text NOT NULL,
	`database_type` text NOT NULL,
	`cron_string` text(255) NOT NULL,
	`team_id` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_backup_job`("id", "name", "authentication_data", "database_type", "cron_string", "team_id") SELECT "id", "name", "authentication_data", "database_type", "cron_string", "team_id" FROM `backup_job`;--> statement-breakpoint
DROP TABLE `backup_job`;--> statement-breakpoint
ALTER TABLE `__new_backup_job` RENAME TO `backup_job`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_backup_job_run` (
	`id` text PRIMARY KEY DEFAULT 'K9keXoj_tukZ75sqTyzzv' NOT NULL,
	`invocation_type` text NOT NULL,
	`backup_job_id` text NOT NULL,
	`started_at` integer DEFAULT (current_timestamp) NOT NULL,
	`completed_at` integer,
	`result` text,
	FOREIGN KEY (`backup_job_id`) REFERENCES `backup_job`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_backup_job_run`("id", "invocation_type", "backup_job_id", "started_at", "completed_at", "result") SELECT "id", "invocation_type", "backup_job_id", "started_at", "completed_at", "result" FROM `backup_job_run`;--> statement-breakpoint
DROP TABLE `backup_job_run`;--> statement-breakpoint
ALTER TABLE `__new_backup_job_run` RENAME TO `backup_job_run`;--> statement-breakpoint
CREATE TABLE `__new_log` (
	`id` text PRIMARY KEY DEFAULT '-uSM8wQav1gg9JOy3ZFZM' NOT NULL,
	`log_type` text NOT NULL,
	`message` text(255) NOT NULL,
	`occurred_at` integer DEFAULT (current_timestamp) NOT NULL,
	`team_id` text
);
--> statement-breakpoint
INSERT INTO `__new_log`("id", "log_type", "message", "occurred_at", "team_id") SELECT "id", "log_type", "message", "occurred_at", "team_id" FROM `log`;--> statement-breakpoint
DROP TABLE `log`;--> statement-breakpoint
ALTER TABLE `__new_log` RENAME TO `log`;--> statement-breakpoint
CREATE TABLE `__new_team` (
	`id` text PRIMARY KEY DEFAULT 'team_Kxjr2ebHxf-77vHe_X5Ig' NOT NULL,
	`name` text(255) NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	`isprivate` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_team`("id", "name", "created_at", "updated_at", "isprivate") SELECT "id", "name", "created_at", "updated_at", "isprivate" FROM `team`;--> statement-breakpoint
DROP TABLE `team`;--> statement-breakpoint
ALTER TABLE `__new_team` RENAME TO `team`;--> statement-breakpoint
CREATE TABLE `__new_team_invite` (
	`id` text PRIMARY KEY DEFAULT 'invite_8MPIbFuBE5R9JKi-zVSmp' NOT NULL,
	`team_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_team_invite`("id", "team_id", "email", "created_at", "expires_at", "accepted_at") SELECT "id", "team_id", "email", "created_at", "expires_at", "accepted_at" FROM `team_invite`;--> statement-breakpoint
DROP TABLE `team_invite`;--> statement-breakpoint
ALTER TABLE `__new_team_invite` RENAME TO `team_invite`;