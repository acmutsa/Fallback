import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
	path: "../../.env",
});

export default defineConfig({
	schema: "./schema.ts",
	out: "./drizzle",
	dialect: "turso",
	casing: "snake_case",
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN,
	},
	breakpoints: true,
});
