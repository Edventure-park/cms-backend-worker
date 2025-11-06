import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { mailServers } from "../../db/schema";
import { nanoid } from "nanoid";

// ----------------------
// CREATE Mail Server
// ----------------------
export const addMailServer = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();

    const { name, hostname, dailyLimit, monthlyLimit, priority } = body;

    // Basic validation
    if (!name || !hostname || !dailyLimit || !monthlyLimit) {
      return c.json(
        {
          success: false,
          message: "Missing required fields: name, hostname, dailyLimit, monthlyLimit",
          error: "VALIDATION_ERROR",
        },
        400
      );
    }

    // Generate unique server ID
    const serverId = `MAIL-${nanoid(8).toUpperCase()}`;
    const now = new Date().toISOString();

    const newServer = {
      serverId,
      name,
      hostname,
      dailyLimit: Number(dailyLimit),
      monthlyLimit: Number(monthlyLimit),
      dailySent: 0,
      monthlySent: 0,
      lastDailyReset: now,
      lastMonthlyReset: now,
      status: "active",
      priority: Number(priority || 0),
      consecutiveFailures: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(mailServers).values(newServer).returning();

    return c.json(
      {
        success: true,
        message: "Mail server added successfully",
        data: result[0],
      },
      201
    );
  } catch (error) {
    console.error("Error adding mail server:", error);
    return c.json(
      {
        success: false,
        message: "Failed to add mail server",
        error: "INTERNAL_SERVER_ERROR",
      },
      500
    );
  }
};

// ----------------------
// READ: Get All Mail Servers
// ----------------------
export const getAllMailServers = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const servers = await db
      .select()
      .from(mailServers)
      .orderBy(desc(mailServers.priority));

    return c.json({
      success: true,
      count: servers.length,
      data: servers,
    });
  } catch (error) {
    console.error("Error fetching mail servers:", error);
    return c.json(
      { success: false, message: "Failed to fetch mail servers", error: "INTERNAL_SERVER_ERROR" },
      500
    );
  }
};

// ----------------------
// READ: Get Mail Server by ID
// ----------------------
export const getMailServerById = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const serverId = c.req.param("serverId")?.trim();

    if (!serverId) {
      return c.json({ success: false, message: "Missing serverId parameter", error: "MISSING_ID" }, 400);
    }

    const server = await db
      .select()
      .from(mailServers)
      .where(eq(mailServers.serverId, serverId))
      .limit(1)
      .then(res => res[0]);

    if (!server) {
      return c.json({ success: false, message: `Mail server '${serverId}' not found`, error: "NOT_FOUND" }, 404);
    }

    return c.json({ success: true, data: server });
  } catch (error) {
    console.error("Error fetching mail server:", error);
    return c.json(
      { success: false, message: "Failed to fetch mail server", error: "INTERNAL_SERVER_ERROR" },
      500
    );
  }
};

// ----------------------
// UPDATE Mail Server
// ----------------------
export const updateMailServerById = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const serverId = c.req.param("serverId")?.trim();
    const body = await c.req.json();

    if (!serverId) {
      return c.json({ success: false, message: "Missing serverId parameter", error: "MISSING_ID" }, 400);
    }

    // Check if server exists
    const existing = await db
      .select()
      .from(mailServers)
      .where(eq(mailServers.serverId, serverId))
      .limit(1)
      .then(res => res[0]);

    if (!existing) {
      return c.json({ success: false, message: `Mail server '${serverId}' not found`, error: "NOT_FOUND" }, 404);
    }

    const updatedAt = new Date().toISOString();

    const updates = {
      name: body.name ?? existing.name,
      hostname: body.hostname ?? existing.hostname,
      dailyLimit: body.dailyLimit ?? existing.dailyLimit,
      monthlyLimit: body.monthlyLimit ?? existing.monthlyLimit,
      status: body.status ?? existing.status,
      priority: body.priority ?? existing.priority,
      updatedAt,
    };

    const result = await db
      .update(mailServers)
      .set(updates)
      .where(eq(mailServers.serverId, serverId))
      .returning();

    return c.json({
      success: true,
      message: "Mail server updated successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating mail server:", error);
    return c.json(
      { success: false, message: "Failed to update mail server", error: "INTERNAL_SERVER_ERROR" },
      500
    );
  }
};

// ----------------------
// DELETE Mail Server
// ----------------------
export const deleteMailServerById = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const serverId = c.req.param("serverId")?.trim();

    if (!serverId) {
      return c.json({ success: false, message: "Missing serverId parameter", error: "MISSING_ID" }, 400);
    }

    const existing = await db
      .select()
      .from(mailServers)
      .where(eq(mailServers.serverId, serverId))
      .limit(1)
      .then(res => res[0]);

    if (!existing) {
      return c.json({ success: false, message: `Mail server '${serverId}' not found`, error: "NOT_FOUND" }, 404);
    }

    const result = await db
      .delete(mailServers)
      .where(eq(mailServers.serverId, serverId))
      .returning({ id: mailServers.id });

    if (!result?.length) {
      return c.json({ success: false, message: "Failed to delete mail server", error: "DELETE_FAILED" }, 500);
    }

    return c.json({
      success: true,
      message: "Mail server deleted successfully",
      data: {
        serverId: existing.serverId,
        name: existing.name,
        hostname: existing.hostname,
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error deleting mail server:", error);
    return c.json(
      { success: false, message: "Failed to delete mail server", error: "INTERNAL_SERVER_ERROR" },
      500
    );
  }
};
