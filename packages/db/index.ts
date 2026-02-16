import { drizzle } from "drizzle-orm/libsql/web";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config({
	path: "../../.env",
});

export * from "drizzle-orm";
export * from "./schema";
export * from "./queries";

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle({ client, casing: "snake_case", schema });
