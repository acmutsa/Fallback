ALTER TABLE `log` ADD `route` text;--> statement-breakpoint
ALTER TABLE `log` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `team_invite` ADD `role` text DEFAULT 'MEMBER' NOT NULL;