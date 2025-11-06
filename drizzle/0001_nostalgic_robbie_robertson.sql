CREATE TABLE `mail_servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` text NOT NULL,
	`name` text NOT NULL,
	`hostname` text NOT NULL,
	`daily_limit` integer NOT NULL,
	`monthly_limit` integer NOT NULL,
	`daily_sent` integer DEFAULT 0 NOT NULL,
	`monthly_sent` integer DEFAULT 0 NOT NULL,
	`last_daily_reset` text NOT NULL,
	`last_monthly_reset` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_servers_server_id_unique` ON `mail_servers` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_mail_servers_status` ON `mail_servers` (`status`);--> statement-breakpoint
CREATE INDEX `idx_mail_servers_priority` ON `mail_servers` (`priority`);