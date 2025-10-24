import { sqliteTable, text, integer, real, index, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";


export const random_table = sqliteTable("random_table", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    value: text("value").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    create_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});