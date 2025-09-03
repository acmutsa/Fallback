import { HonoOptions } from "hono/hono-base";
import { env } from "../../env";
import { Hono } from "hono";
import { BlankEnv } from "hono/types";
import {auth} from "../auth"
import { UserType, SessionType } from "../types";

/**
 * @description Wrapper for the Hono constructor that includes the BetterAuth types
 * @param options Hono options
 */
export function HonoBetterAuth(options?: HonoOptions<BlankEnv> | undefined){
	return new Hono<{
		Variables: {
			user: UserType
			session: SessionType
		}
	}>({
		...options
	})
};
