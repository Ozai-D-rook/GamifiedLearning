import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Lazy database initialization - only fails if actually used
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required to use database storage");
  }
  
  const sql = neon(process.env.DATABASE_URL);
  dbInstance = drizzle(sql, { schema });
  return dbInstance;
}

// Export for backward compatibility with DatabaseStorage
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (_target: any, prop: string | symbol) => {
    const instance = getDb();
    return (instance as any)[prop];
  },
});
