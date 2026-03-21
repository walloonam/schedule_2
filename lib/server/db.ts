import { Pool } from "pg";

declare global {
  var __scheduleDbPool__: Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured. Add it to .env.local before using the events API.");
  }

  return databaseUrl;
}

export function getDbPool() {
  if (!globalThis.__scheduleDbPool__) {
    globalThis.__scheduleDbPool__ = new Pool({
      connectionString: getDatabaseUrl()
    });
  }

  return globalThis.__scheduleDbPool__;
}
