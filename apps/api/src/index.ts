import {
	type ScheduledController,
	type ExecutionContext,
} from "@cloudflare/workers-types";
import {
	authHandler,
	backupHandler,
	userhandler,
	logHandler,
	healthHandler,
	teamHandler,
} from "./routes";
import { generalCorsPolicy, betterAuthCorsPolicy } from "./lib/functions/cors";
import { HonoBetterAuth,  } from "./lib/functions";
import { logError } from "./lib/functions/database";
import {
	setUserSessionContextMiddleware,
	authenticatedMiddleware,
} from "./lib/functions/middleware";
import { db, log } from "db";

interface Env {}

// api stuff
// TODO(https://github.com/acmutsa/Fallback/issues/26): Find a way to run logic after the response has been sent. Something like an After function that NextJS has.
export const api = HonoBetterAuth()
	.use(
		"*",
		generalCorsPolicy, // see if we can get rid of this one maybe later?
		betterAuthCorsPolicy,
		async (c, next) => setUserSessionContextMiddleware(c, next),
		async (c, next) => authenticatedMiddleware(c, next),
	)
	.route("/health", healthHandler)
	.route("/log", logHandler)
	.route("/backup", backupHandler)
	.route("/user", userhandler)
	.route("/api/auth/*", authHandler)
	.route("/team", teamHandler)
	.onError(async (err,c)=>{
		const userId = c.get("user")?.id;
		const teamId = c.get("teamId");
		const route = c.req.path;

		// Log errors that are not caught by the route handlers 
		await db.insert(log).values({
			message:err.message,
			logType:"ERROR",
			userId,
			teamId,
			route,
		})

		return c.json({
			error: "Internal Server Error",
		},500);
		
		


	});


// cron stuff
/**
 * The basic logic for running a cron job in Cloudflare Workers. Will be updated to be more specific later.
 */
const cron = async (
	controller: ScheduledController,
	_: Env,
	ctx: ExecutionContext,
) => {
	// NOTE: controller.cron is what we will use to check what jobs need to be running
	// ctx.waitUntil(doBackup());
};

export default {
	fetch: api.fetch,
	scheduled: cron,
};

// Special type only exported for the web client
export type ApiType = typeof api;
