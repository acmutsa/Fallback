import type { HonoOptions } from "hono/hono-base";
import { Hono } from "hono";
import type { BlankEnv } from "hono/types";
import type { ApiContextVariables } from "../types";

/**
 * Wrapper for the Hono constructor that includes the BetterAuth types
 * @param options Hono options
 * @returns A new Hono instance with the BetterAuth types included
 */
export function HonoBetterAuth(options?: HonoOptions<BlankEnv> | undefined) {
	return new Hono<{
		Variables: ApiContextVariables;
	}>({
		...options,
	});
}

// TODO(https://github.com/acmutsa/Fallback/issues/38): Come back and find out what proper value needs to be here
/**
 * Utility function to check if the application is running in development mode.
 * @returns True if in development mode, false otherwise.
 */
export function isInDevMode() {
	return process.env.NODE_ENV === "development";
}
