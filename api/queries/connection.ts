import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let client: Database.Database;

export function getDb() {
  if (!instance) {
    client = new Database("./ghostsites.db");
    client.pragma("journal_mode = WAL");
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
