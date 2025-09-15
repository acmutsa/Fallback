import type { HonoOptions } from "hono/hono-base";
import { Hono } from "hono";
import type { BlankEnv } from "hono/types";
import type { UserType, SessionType } from "../types";

/**
 * @description Wrapper for the Hono constructor that includes the BetterAuth types
 * @param options Hono options
 */
export function HonoBetterAuth(options?: HonoOptions<BlankEnv> | undefined) {
	return new Hono<{
		Variables: {
			user: UserType;
			session: SessionType;
		};
	}>({
		...options,
	});
}
