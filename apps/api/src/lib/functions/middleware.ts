import type { Context, Next } from "hono";
import { auth } from "../auth";

export const MIDDLEWARE_PUBLIC_ROUTES = ["/health", "/api/auth"];
//TODO(https://github.com/acmutsa/Fallback/issues/16): Make these function's context types safe

export async function setUserSessionContextMiddleware(c: Context, next: Next) {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		c.set("teamId", null);
		return next();
	}

	c.set("user", session.user);
	c.set("session", session.session);
	return next();
}

// TODO: Make this type safe
export async function authenticatedMiddleware(c: Context, next: Next) {
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
		return c.json({ error: "Unauthorized" }, 401);
	}
	return next();
}
