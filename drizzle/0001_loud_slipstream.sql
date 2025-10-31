CREATE TABLE `mail_bounces` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bounce_id` text NOT NULL,
	`mail_id` text NOT NULL,
	`bounce_type` text NOT NULL,
	`bounce_sub_type` text,
	`email_address` text NOT NULL,
	`diagnostic_code` text,
	`action` text,
	`status` text,
	`bounced_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`mail_id`) REFERENCES `mails`(`mail_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_bounces_bounce_id_unique` ON `mail_bounces` (`bounce_id`);--> statement-breakpoint
CREATE INDEX `idx_bounces_mail_id` ON `mail_bounces` (`mail_id`);--> statement-breakpoint
CREATE INDEX `idx_bounces_email` ON `mail_bounces` (`email_address`);--> statement-breakpoint
CREATE INDEX `idx_bounces_type` ON `mail_bounces` (`bounce_type`);--> statement-breakpoint
CREATE TABLE `mail_campaigns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`campaign_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`total_mails` integer DEFAULT 0 NOT NULL,
	`queued_count` integer DEFAULT 0 NOT NULL,
	`sent_count` integer DEFAULT 0 NOT NULL,
	`failed_count` integer DEFAULT 0 NOT NULL,
	`bounced_count` integer DEFAULT 0 NOT NULL,
	`scheduled_at` text,
	`started_at` text,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_campaigns_campaign_id_unique` ON `mail_campaigns` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `idx_campaigns_status` ON `mail_campaigns` (`status`);--> statement-breakpoint
CREATE INDEX `idx_campaigns_type` ON `mail_campaigns` (`type`);--> statement-breakpoint
CREATE TABLE `mail_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`mail_id` text NOT NULL,
	`server_id` text,
	`event_type` text NOT NULL,
	`event_data` text,
	`previous_status` text,
	`new_status` text,
	`triggered_by` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`mail_id`) REFERENCES `mails`(`mail_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`server_id`) REFERENCES `mail_servers`(`server_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_events_event_id_unique` ON `mail_events` (`event_id`);--> statement-breakpoint
CREATE INDEX `idx_events_mail_id` ON `mail_events` (`mail_id`);--> statement-breakpoint
CREATE INDEX `idx_events_type` ON `mail_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `idx_events_created_at` ON `mail_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `mail_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`queue_id` text NOT NULL,
	`mail_id` text NOT NULL,
	`server_id` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`reason` text,
	`queued_at` text NOT NULL,
	`scheduled_for` text,
	`next_retry_at` text,
	`processing_started_at` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`backoff_seconds` integer DEFAULT 0 NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`mail_id`) REFERENCES `mails`(`mail_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`server_id`) REFERENCES `mail_servers`(`server_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_queue_queue_id_unique` ON `mail_queue` (`queue_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `mail_queue_mail_id_unique` ON `mail_queue` (`mail_id`);--> statement-breakpoint
CREATE INDEX `idx_queue_status` ON `mail_queue` (`status`);--> statement-breakpoint
CREATE INDEX `idx_queue_next_retry` ON `mail_queue` (`next_retry_at`);--> statement-breakpoint
CREATE INDEX `idx_queue_scheduled_for` ON `mail_queue` (`scheduled_for`);--> statement-breakpoint
CREATE INDEX `idx_queue_priority` ON `mail_queue` (`priority`);--> statement-breakpoint
CREATE TABLE `mail_retries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`retry_id` text NOT NULL,
	`mail_id` text NOT NULL,
	`server_id` text,
	`attempt_number` integer NOT NULL,
	`attempted_at` text NOT NULL,
	`success` integer DEFAULT false NOT NULL,
	`error_message` text,
	`error_code` text,
	`next_retry_at` text,
	`backoff_applied` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`mail_id`) REFERENCES `mails`(`mail_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`server_id`) REFERENCES `mail_servers`(`server_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_retries_retry_id_unique` ON `mail_retries` (`retry_id`);--> statement-breakpoint
CREATE INDEX `idx_retries_mail_id` ON `mail_retries` (`mail_id`);--> statement-breakpoint
CREATE INDEX `idx_retries_attempted_at` ON `mail_retries` (`attempted_at`);--> statement-breakpoint
CREATE TABLE `mail_server_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`metric_id` text NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`period_type` text NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`mails_sent` integer DEFAULT 0 NOT NULL,
	`mails_failed` integer DEFAULT 0 NOT NULL,
	`mails_queued` integer DEFAULT 0 NOT NULL,
	`mails_bounced` integer DEFAULT 0 NOT NULL,
	`mails_retried` integer DEFAULT 0 NOT NULL,
	`avg_latency_ms` integer DEFAULT 0 NOT NULL,
	`min_latency_ms` integer,
	`max_latency_ms` integer,
	`success_rate` real DEFAULT 1 NOT NULL,
	`uptime` integer DEFAULT 100 NOT NULL,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `mail_servers`(`server_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_server_metrics_metric_id_unique` ON `mail_server_metrics` (`metric_id`);--> statement-breakpoint
CREATE INDEX `idx_metrics_server_id` ON `mail_server_metrics` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_metrics_timestamp` ON `mail_server_metrics` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_metrics_period_type` ON `mail_server_metrics` (`period_type`);--> statement-breakpoint
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
	`last_health_check` text,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_servers_server_id_unique` ON `mail_servers` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_mail_servers_status` ON `mail_servers` (`status`);--> statement-breakpoint
CREATE INDEX `idx_mail_servers_priority` ON `mail_servers` (`priority`);--> statement-breakpoint
CREATE TABLE `mail_suppressions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`suppression_id` text NOT NULL,
	`email_address` text NOT NULL,
	`reason` text NOT NULL,
	`source` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`suppressed_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_suppressions_suppression_id_unique` ON `mail_suppressions` (`suppression_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `mail_suppressions_email_address_unique` ON `mail_suppressions` (`email_address`);--> statement-breakpoint
CREATE INDEX `idx_suppressions_email` ON `mail_suppressions` (`email_address`);--> statement-breakpoint
CREATE INDEX `idx_suppressions_reason` ON `mail_suppressions` (`reason`);--> statement-breakpoint
CREATE INDEX `idx_suppressions_is_active` ON `mail_suppressions` (`is_active`);--> statement-breakpoint
CREATE TABLE `mail_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`template_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`subject` text NOT NULL,
	`body_html` text,
	`body_text` text,
	`variables` text,
	`category` text,
	`version` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`times_used` integer DEFAULT 0 NOT NULL,
	`last_used_at` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_templates_template_id_unique` ON `mail_templates` (`template_id`);--> statement-breakpoint
CREATE INDEX `idx_templates_category` ON `mail_templates` (`category`);--> statement-breakpoint
CREATE INDEX `idx_templates_is_active` ON `mail_templates` (`is_active`);--> statement-breakpoint
CREATE TABLE `mails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mail_id` text NOT NULL,
	`campaign_id` text,
	`server_id` text,
	`to_address` text NOT NULL,
	`from_address` text NOT NULL,
	`subject` text NOT NULL,
	`body_html` text,
	`body_text` text,
	`attachments` text,
	`custom_headers` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`send_attempt_count` integer DEFAULT 0 NOT NULL,
	`max_retries` integer DEFAULT 3 NOT NULL,
	`last_attempt_at` text,
	`sent_at` text,
	`error_message` text,
	`error_code` text,
	`recipient_name` text,
	`recipient_user_id` text,
	`tags` text,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `mail_campaigns`(`campaign_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`server_id`) REFERENCES `mail_servers`(`server_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mails_mail_id_unique` ON `mails` (`mail_id`);--> statement-breakpoint
CREATE INDEX `idx_mails_status` ON `mails` (`status`);--> statement-breakpoint
CREATE INDEX `idx_mails_campaign` ON `mails` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `idx_mails_server` ON `mails` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_mails_to_address` ON `mails` (`to_address`);--> statement-breakpoint
CREATE INDEX `idx_mails_created_at` ON `mails` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_mails_status_created` ON `mails` (`status`,`created_at`);