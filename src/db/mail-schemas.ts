import { sqliteTable, text, integer, real, index, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Mail Servers - Tracks mail servers and their limits
export const mailServers = sqliteTable("mail_servers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Server identification
  serverId: text("server_id").notNull().unique(), // e.g., "MAIL-SERVER-001"
  name: text("name").notNull(), // e.g., "mail-server-1"
  hostname: text("hostname").notNull(), // 'resend', 'mailtrap'
  
  // Limits and usage
  dailyLimit: integer("daily_limit").notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  dailySent: integer("daily_sent").default(0).notNull(),
  monthlySent: integer("monthly_sent").default(0).notNull(),
  
  // Reset tracking
  lastDailyReset: text("last_daily_reset").notNull(),
  lastMonthlyReset: text("last_monthly_reset").notNull(),
  
  // Server status
  status: text("status").default("active").notNull(), // active, cooldown, disabled, maintenance
  priority: integer("priority").default(0).notNull(), // Higher priority servers used first
  
  // Health tracking
  lastHealthCheck: text("last_health_check"),
  consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
  
  // Metadata
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  statusIdx: index("idx_mail_servers_status").on(table.status),
  priorityIdx: index("idx_mail_servers_priority").on(table.priority),
}));

// 2. Mail Campaigns - Groups related emails for tracking
export const mailCampaigns = sqliteTable("mail_campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Campaign identification
  campaignId: text("campaign_id").notNull().unique(), // e.g., "CAMP-FF", "CAMP-BS", "CAMP-EDTALK" "CAMP-ANNOUNCEMENT"
  name: text("name").notNull(),
  type: text("type").notNull(), // bulk, transactional, notification, marketing
  
  // Campaign details
  description: text("description"),
  
  // Status and metrics
  status: text("status").default("draft").notNull(), // draft, running, paused, completed, cancelled
  totalMails: integer("total_mails").default(0).notNull(),
  queuedCount: integer("queued_count").default(0).notNull(),
  sentCount: integer("sent_count").default(0).notNull(),
  failedCount: integer("failed_count").default(0).notNull(),
  bouncedCount: integer("bounced_count").default(0).notNull(),
  
  // Scheduling
  scheduledAt: text("scheduled_at"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  
  // Metadata
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  statusIdx: index("idx_campaigns_status").on(table.status),
  typeIdx: index("idx_campaigns_type").on(table.type),
}));

// 3. Mails - Master log for all emails
export const mails = sqliteTable("mails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Mail identification
  mailId: text("mail_id").notNull().unique(), // e.g., "MAIL-XYZ789"
  
  // Relationships
  campaignId: text("campaign_id").references(() => mailCampaigns.campaignId),
  serverId: text("server_id").references(() => mailServers.serverId),
  
  // Email details
  toAddress: text("to_address").notNull(),
  fromAddress: text("from_address").notNull(),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  
  // Attachments (stored as JSON array)
  attachments: text("attachments"), // JSON: [{ filename, contentType, size }]
  
  // Headers (stored as JSON)
  customHeaders: text("custom_headers"), // JSON: { "X-Custom": "value" }
  
  // Status and tracking
  status: text("status").default("queued").notNull(), // queued, sending, sent, failed, bounced, retrying
  priority: integer("priority").default(0).notNull(), // Higher = more urgent
  
  // Attempt tracking
  sendAttemptCount: integer("send_attempt_count").default(0).notNull(),
  maxRetries: integer("max_retries").default(3).notNull(),
  lastAttemptAt: text("last_attempt_at"),
  sentAt: text("sent_at"),
  
  // Error tracking
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  
  // Recipient tracking
  recipientName: text("recipient_name"),
  recipientUserId: text("recipient_user_id"),
  
  // Metadata
  tags: text("tags"), // JSON array for categorization
  metadata: text("metadata"), // JSON for additional data
  
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  statusIdx: index("idx_mails_status").on(table.status),
  campaignIdx: index("idx_mails_campaign").on(table.campaignId),
  serverIdx: index("idx_mails_server").on(table.serverId),
  toAddressIdx: index("idx_mails_to_address").on(table.toAddress),
  createdAtIdx: index("idx_mails_created_at").on(table.createdAt),
  statusCreatedIdx: index("idx_mails_status_created").on(table.status, table.createdAt),
}));

// 4. Mail Queue - Pending/delayed emails
export const mailQueue = sqliteTable("mail_queue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Queue identification
  queueId: text("queue_id").notNull().unique(),
  mailId: text("mail_id").references(() => mails.mailId).notNull().unique(),
  serverId: text("server_id").references(() => mailServers.serverId),
  
  // Queue status
  status: text("status").default("queued").notNull(), // queued, processing, delayed, retrying
  reason: text("reason"), // limit_exceeded, server_unavailable, rate_limit, manual_delay
  
  // Timing
  queuedAt: text("queued_at").notNull(),
  scheduledFor: text("scheduled_for"), // When to send
  nextRetryAt: text("next_retry_at"),
  processingStartedAt: text("processing_started_at"),
  
  // Retry configuration
  retryCount: integer("retry_count").default(0).notNull(),
  backoffSeconds: integer("backoff_seconds").default(0).notNull(),
  
  // Priority
  priority: integer("priority").default(0).notNull(),
  
  // Metadata
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  statusIdx: index("idx_queue_status").on(table.status),
  nextRetryIdx: index("idx_queue_next_retry").on(table.nextRetryAt),
  scheduledForIdx: index("idx_queue_scheduled_for").on(table.scheduledFor),
  priorityIdx: index("idx_queue_priority").on(table.priority),
}));

// 5. Mail Retries - Detailed retry attempt logs
export const mailRetries = sqliteTable("mail_retries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Retry identification
  retryId: text("retry_id").notNull().unique(),
  mailId: text("mail_id").references(() => mails.mailId).notNull(),
  serverId: text("server_id").references(() => mailServers.serverId),
  
  // Retry details
  attemptNumber: integer("attempt_number").notNull(),
  attemptedAt: text("attempted_at").notNull(),
  success: integer("success", { mode: "boolean" }).default(false).notNull(),
  
  // Error tracking
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  
  // Retry scheduling
  nextRetryAt: text("next_retry_at"),
  backoffApplied: integer("backoff_applied").notNull(), // in seconds
  
  // Metadata
  createdAt: text("created_at").notNull(),
}, (table) => ({
  mailIdIdx: index("idx_retries_mail_id").on(table.mailId),
  attemptedAtIdx: index("idx_retries_attempted_at").on(table.attemptedAt),
}));

// 6. Mail Events - Event log for all state transitions
export const mailEvents = sqliteTable("mail_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Event identification
  eventId: text("event_id").notNull().unique(),
  mailId: text("mail_id").references(() => mails.mailId).notNull(),
  serverId: text("server_id").references(() => mailServers.serverId),
  
  // Event details
  eventType: text("event_type").notNull(), // created, queued, sending, sent, failed, bounced, retried, opened, clicked
  eventData: text("event_data"), // JSON blob with event-specific data
  
  // Status tracking
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  
  // Source tracking
  triggeredBy: text("triggered_by"), // system, user, webhook, cron
  
  // Metadata
  createdAt: text("created_at").notNull(),
}, (table) => ({
  mailIdIdx: index("idx_events_mail_id").on(table.mailId),
  eventTypeIdx: index("idx_events_type").on(table.eventType),
  createdAtIdx: index("idx_events_created_at").on(table.createdAt),
}));

// 7. Mail Server Metrics - Performance and health metrics
export const mailServerMetrics = sqliteTable("mail_server_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Metric identification
  metricId: text("metric_id").notNull().unique(),
  serverId: text("server_id").references(() => mailServers.serverId).notNull(),
  
  // Time window
  timestamp: text("timestamp").notNull(),
  periodType: text("period_type").notNull(), // hourly, daily, monthly
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  
  // Counters
  mailsSent: integer("mails_sent").default(0).notNull(),
  mailsFailed: integer("mails_failed").default(0).notNull(),
  mailsQueued: integer("mails_queued").default(0).notNull(),
  mailsBounced: integer("mails_bounced").default(0).notNull(),
  mailsRetried: integer("mails_retried").default(0).notNull(),
  
  // Performance metrics
  avgLatencyMs: integer("avg_latency_ms").default(0).notNull(),
  minLatencyMs: integer("min_latency_ms"),
  maxLatencyMs: integer("max_latency_ms"),
  
  // Success rate
  successRate: real("success_rate").default(1.0).notNull(),
  
  // Health indicators
  uptime: integer("uptime").default(100).notNull(), // percentage
  consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
  
  // Metadata
  createdAt: text("created_at").notNull(),
}, (table) => ({
  serverIdIdx: index("idx_metrics_server_id").on(table.serverId),
  timestampIdx: index("idx_metrics_timestamp").on(table.timestamp),
  periodTypeIdx: index("idx_metrics_period_type").on(table.periodType),
}));

// 8. Mail Templates - Reusable email templates
export const mailTemplates = sqliteTable("mail_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Template identification
  templateId: text("template_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Template content
  subject: text("subject").notNull(),
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  
  // Variables (stored as JSON array)
  variables: text("variables"), // JSON: ["{{name}}", "{{email}}"]
  
  // Template metadata
  category: text("category"), // transactional, marketing, notification
  version: integer("version").default(1).notNull(),
  
  // Status
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  
  // Usage tracking
  timesUsed: integer("times_used").default(0).notNull(),
  lastUsedAt: text("last_used_at"),
  
  // Metadata
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  categoryIdx: index("idx_templates_category").on(table.category),
  isActiveIdx: index("idx_templates_is_active").on(table.isActive),
}));

// 9. Mail Bounces - Detailed bounce tracking
export const mailBounces = sqliteTable("mail_bounces", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Bounce identification
  bounceId: text("bounce_id").notNull().unique(),
  mailId: text("mail_id").references(() => mails.mailId).notNull(),
  
  // Bounce details
  bounceType: text("bounce_type").notNull(), // hard, soft, transient
  bounceSubType: text("bounce_sub_type"), // mailbox_full, invalid_address, spam, etc.
  
  // Email address that bounced
  emailAddress: text("email_address").notNull(),
  
  // Diagnostic information
  diagnosticCode: text("diagnostic_code"),
  action: text("action"), // failed, delayed, delivered
  status: text("status"), // 5.x.x status codes
  
  // Metadata
  bouncedAt: text("bounced_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  mailIdIdx: index("idx_bounces_mail_id").on(table.mailId),
  emailAddressIdx: index("idx_bounces_email").on(table.emailAddress),
  bounceTypeIdx: index("idx_bounces_type").on(table.bounceType),
}));

// 10. Mail Suppressions - Suppression list (unsubscribe, bounce, complaint)
export const mailSuppressions = sqliteTable("mail_suppressions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Suppression identification
  suppressionId: text("suppression_id").notNull().unique(),
  emailAddress: text("email_address").notNull().unique(),
  
  // Suppression type
  reason: text("reason").notNull(), // unsubscribed, bounced, complaint, manual
  source: text("source"), // user_action, system, admin
  
  // Details
  notes: text("notes"),
  
  // Status
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  
  // Metadata
  suppressedAt: text("suppressed_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  emailIdx: index("idx_suppressions_email").on(table.emailAddress),
  reasonIdx: index("idx_suppressions_reason").on(table.reason),
  isActiveIdx: index("idx_suppressions_is_active").on(table.isActive),
}));