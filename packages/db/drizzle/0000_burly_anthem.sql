CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `backup_job` (
	`id` text PRIMARY KEY DEFAULT 'job_Uo08ixz9YL0TyOEs0Rb8-' NOT NULL,
	`name` text(255) NOT NULL,
	`authentication_data` blob NOT NULL,
	`databaseType` text NOT NULL,
	`cronString` text(255) NOT NULL,
	`team_id` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `backup_job_run` (
	`id` text PRIMARY KEY DEFAULT 'tDmkUTi21o31TBOr30l_t' NOT NULL,
	`invocationType` text NOT NULL,
	`databaseType` text NOT NULL,
	`team_id` text NOT NULL,
	`startedAt` integer DEFAULT (current_timestamp) NOT NULL,
	`completedAt` integer,
	`result` text,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `log` (
	`id` text PRIMARY KEY DEFAULT 'Wh4vcUY8VKKc5f3-dqD-b' NOT NULL,
	`logType` text NOT NULL,
	`message` text(255) NOT NULL,
	`occurredAt` integer DEFAULT (current_timestamp) NOT NULL,
	`team_id` text
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `team` (
	`id` text PRIMARY KEY DEFAULT 'team_IXqln_REYURcJvr8D8TxV' NOT NULL,
	`name` text(255) NOT NULL,
	`createdAt` integer DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` integer DEFAULT (current_timestamp) NOT NULL,
	`isprivate` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `team_invite` (
	`id` text PRIMARY KEY DEFAULT 'invite_duPSKBsqK32Ec7-zjmU-b' NOT NULL,
	`team_id` text NOT NULL,
	`email` text NOT NULL,
	`createdAt` integer DEFAULT (current_timestamp) NOT NULL,
	`expiresAt` integer NOT NULL,
	`acceptedAt` integer,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text(255) NOT NULL,
	`last_name` text(255) NOT NULL,
	`email` text NOT NULL,
	`pronouns` text(255),
	`createdAt` integer DEFAULT (current_timestamp) NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`updated_at` integer NOT NULL,
	`lastSeen` integer DEFAULT (current_timestamp) NOT NULL,
	`siteRole` text DEFAULT 'USER' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_to_team` (
	`user_id` text NOT NULL,
	`team_id` text NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	PRIMARY KEY(`user_id`, `team_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
