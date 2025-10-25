import { cors } from "hono/cors";
import { env } from "../../env";

/**
 * General CORS policy for the API. Will run on every request, but others can be specified for individual routes.
 */
export const generalCorsPolicy = cors({
	origin: env.VITE_FALLBACK_WEB_URL,
	allowHeaders: [
		"Content-Type",
		"Authorization",
		"Access-Control-Allow-Origin",
	],
	allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	exposeHeaders: ["Content-Length"],
	maxAge: 600,
	credentials: true,
});

/**
 * CORS policy specifically for the Better Auth routes.
 */
export const betterAuthCorsPolicy = cors({
	origin: env.VITE_FALLBACK_WEB_URL,
	allowHeaders: ["Content-Type", "Authorization"],
	allowMethods: ["POST", "GET", "OPTIONS"],
	exposeHeaders: ["Content-Length"],
	maxAge: 600,
	credentials: true,
});
