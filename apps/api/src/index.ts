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
} from "./routes";
import { generalCorsPolicy, betterAuthCorsPolicy } from "./lib/functions/cors";
import { HonoBetterAuth } from "./lib/functions";
import {
	setUserSessionContextMiddleware,
	authenticatedMiddleware,
} from "./lib/functions/middleware";

interface Env {}

// api stuff
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
	.route("/api/auth/*", authHandler); 

///

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
