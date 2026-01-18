PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_log` (
	`id` integer PRIMARY KEY NOT NULL,
	`log_type` text NOT NULL,
	`message` text(255) NOT NULL,
	`occurred_at` integer DEFAULT (current_timestamp) NOT NULL,
	`route` text,
	`team_id` text,
	`user_id` text
);
--> statement-breakpoint
INSERT INTO `__new_log`("id", "log_type", "message", "occurred_at", "route", "team_id", "user_id") SELECT "id", "log_type", "message", "occurred_at", "route", "team_id", "user_id" FROM `log`;--> statement-breakpoint
DROP TABLE `log`;--> statement-breakpoint
ALTER TABLE `__new_log` RENAME TO `log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;