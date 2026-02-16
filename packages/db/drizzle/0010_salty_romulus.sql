PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_team_invite` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text(255) NOT NULL,
	`email` text(255) NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_team_invite`("id", "team_id", "email", "created_at", "expires_at", "accepted_at", "role") SELECT "id", "team_id", "email", "created_at", "expires_at", "accepted_at", "role" FROM `team_invite`;--> statement-breakpoint
DROP TABLE `team_invite`;--> statement-breakpoint
ALTER TABLE `__new_team_invite` RENAME TO `team_invite`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `log` ALTER COLUMN "route" TO "route" text(255);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `log` ALTER COLUMN "request_id" TO "request_id" text(255);