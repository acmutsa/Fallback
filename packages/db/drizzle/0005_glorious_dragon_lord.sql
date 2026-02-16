CREATE TABLE `team_join_request` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
