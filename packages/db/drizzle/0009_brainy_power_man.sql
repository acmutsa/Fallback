PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_backup_job` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`authentication_data` text NOT NULL,
	`database_type` text NOT NULL,
	`cron_string` text(255) NOT NULL,
	`team_id` text(255) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_backup_job`("id", "name", "authentication_data", "database_type", "cron_string", "team_id") SELECT "id", "name", "authentication_data", "database_type", "cron_string", "team_id" FROM `backup_job`;--> statement-breakpoint
DROP TABLE `backup_job`;--> statement-breakpoint
ALTER TABLE `__new_backup_job` RENAME TO `backup_job`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_backup_job_run` (
	`id` text PRIMARY KEY NOT NULL,
	`invocation_type` text NOT NULL,
	`backup_job_id` text(255) NOT NULL,
	`started_at` integer DEFAULT (current_timestamp) NOT NULL,
	`completed_at` integer,
	`result` text,
	FOREIGN KEY (`backup_job_id`) REFERENCES `backup_job`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_backup_job_run`("id", "invocation_type", "backup_job_id", "started_at", "completed_at", "result") SELECT "id", "invocation_type", "backup_job_id", "started_at", "completed_at", "result" FROM `backup_job_run`;--> statement-breakpoint
DROP TABLE `backup_job_run`;--> statement-breakpoint
ALTER TABLE `__new_backup_job_run` RENAME TO `backup_job_run`;--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `log` ALTER COLUMN "route" TO "route" text(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `log` ALTER COLUMN "request_id" TO "request_id" text(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `log` ALTER COLUMN "team_id" TO "team_id" text(255);--> statement-breakpoint
ALTER TABLE `log` ALTER COLUMN "user_id" TO "user_id" text(255);--> statement-breakpoint
ALTER TABLE `log` ADD `time_elapsed_ms` integer;--> statement-breakpoint
CREATE TABLE `__new_team_invite` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text(255) NOT NULL,
	`email` text(255) NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`email`) REFERENCES `user`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_team_invite`("id", "team_id", "email", "created_at", "expires_at", "accepted_at", "role") SELECT "id", "team_id", "email", "created_at", "expires_at", "accepted_at", "role" FROM `team_invite`;--> statement-breakpoint
DROP TABLE `team_invite`;--> statement-breakpoint
ALTER TABLE `__new_team_invite` RENAME TO `team_invite`;--> statement-breakpoint
CREATE TABLE `__new_team_join_request` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text(255) NOT NULL,
	`user_id` text(255) NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_team_join_request`("id", "team_id", "user_id", "created_at", "status") SELECT "id", "team_id", "user_id", "created_at", "status" FROM `team_join_request`;--> statement-breakpoint
DROP TABLE `team_join_request`;--> statement-breakpoint
ALTER TABLE `__new_team_join_request` RENAME TO `team_join_request`;--> statement-breakpoint
CREATE TABLE `__new_user_to_team` (
	`user_id` text(255) NOT NULL,
	`team_id` text(255) NOT NULL,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	PRIMARY KEY(`user_id`, `team_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_to_team`("user_id", "team_id", "role") SELECT "user_id", "team_id", "role" FROM `user_to_team`;--> statement-breakpoint
DROP TABLE `user_to_team`;--> statement-breakpoint
ALTER TABLE `__new_user_to_team` RENAME TO `user_to_team`;