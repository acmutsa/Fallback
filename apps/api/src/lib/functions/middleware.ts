import type { Context, Next } from "hono";
import { auth } from "../auth";
import { logInfo } from "./database";
import { nanoid } from "nanoid";
import type { ApiContext } from "../types";
import { API_ERROR_MESSAGES } from "shared";

export const MIDDLEWARE_PUBLIC_ROUTES = ["/health", "/api/auth"];

export async function setUserSessionContextMiddleware(c: Context, next: Next) {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	const userString = session
		? `Authenticated user (id: ${session?.user.id})`
		: "Unauthenticated User";

	const requestId = nanoid();
	c.set("requestId", requestId);

	await logInfo(
		`Middleware for request path ${c.req.path} for ${userString}`,
		c,
	);

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

export async function authenticatedMiddleware(c: ApiContext, next: Next) {
	// First check if it is a public route and if so we will return (make sure this works)
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

/*
 * Middleware to handle logging the request and results of request afterwards. Context object is apparently stateful
 */
export async function afterRouteLogicMiddleware(c: ApiContext, next: Next) {
	// TODO(https://github.com/acmutsa/Fallback/issues/26): Come back and finish logging function
	console.log("context before is: ", c.get("teamId"));
	await next();
	console.log("context after is: ", c.get("teamId"));
}
