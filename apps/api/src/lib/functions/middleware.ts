import type { Context, Next } from "hono";
import { auth } from "../auth";
import { logInfo } from "./database";
import { nanoid } from "nanoid";
import type { ApiContext } from "../types";
import { API_ERROR_MESSAGES } from "shared";

export const MIDDLEWARE_PUBLIC_ROUTES = ["/health", "/api/auth"];
/**
 * Middleware to set user and session context for each request. This middleware checks the authentication status of the incoming request, retrieves the user session if it exists, and sets relevant information in the context for downstream handlers to use. It also logs the request path and authentication status for monitoring purposes.
 * @param c - The Hono context object
 * @param next - The next middleware function in the chain
 */
export async function setUserSessionContextMiddleware(c: Context, next: Next) {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	const userString = session
		? `Authenticated user (id: ${session.user.id})`
		: "Unauthenticated User";

	const requestId = nanoid();
	c.set("requestId", requestId);

	logInfo(`Middleware for request path ${c.req.path} for ${userString}`, c);

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		c.set("teamId", null);
		return next();
	}

	c.set("user", session.user);
	c.set("session", session.session);
	await next();
}

/**
 * Middleware to enforce authentication on protected routes. This middleware checks if the incoming request is targeting a public route, and if not, it verifies that the user is authenticated by checking the context for user and session information. If the user is not authenticated, it logs an unauthorized access attempt and returns a 401 response. If the user is authenticated or if the route is public, it allows the request to proceed to the next handler.
 * @param c - The Hono context object
 * @param next - The next middleware function in the chain
 */
export async function authenticatedMiddleware(c: ApiContext, next: Next) {
	const isPublicRoute = MIDDLEWARE_PUBLIC_ROUTES.some((route) =>
		c.req.path.startsWith(route),
	);
	if (isPublicRoute) {
		return next();
	}
	const user = c.get("user");
	const session = c.get("session");
	if (!(user && session)) {
		logInfo(`Unauthorized access attempt to ${c.req.path}`, c);
		return c.json(
			{
				message: "Please log in.",
				code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
			},
			401,
		);
	}
	return next();
}

/**
 * Middleware to perform actions after the main route logic has executed. This can be used for logging, cleanup, or other post-processing tasks.
 * @param c - The Hono context object
 * @param next - The next middleware function in the chain
 */
export async function afterRouteLogicMiddleware(c: ApiContext, next: Next) {
	// TODO(https://github.com/acmutsa/Fallback/issues/26): Come back and finish logging function
	console.log("context before is: ", c.get("teamId"));
	await next();
	console.log("context after is: ", c.get("teamId"));
}
