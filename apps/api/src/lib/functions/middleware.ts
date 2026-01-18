import type { Context, Next } from "hono";
import { auth } from "../auth";
import { logInfo } from "./database";
import { nanoid } from "nanoid";

// TODO: Consider request sessions in order to track the journey? 
export const MIDDLEWARE_PUBLIC_ROUTES = ["/health", "/api/auth"];
//TODO(https://github.com/acmutsa/Fallback/issues/16): Make these function's context types safe

export async function setUserSessionContextMiddleware(c: Context, next: Next) {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	const userString = session
		? `ID: ${session?.user.id}, Email: ${session.user.email}`
		: "Unauthenticated User";

	const requestId = nanoid();

	await logInfo(`Middleware for request path ${c.req.path} for ${userString}`,{
		route: c.req.path,
		userId: session?.user.id || null,
		requestId
		}
	);

	c.set("requestId", requestId);

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
		await logInfo(`Unauthorized access attempt to ${c.req.path}`,{
			route: c.req.path,
			userId: null
			}
		);
		return c.json({ error: "Unauthorized" }, 401);
	}
	return next();
}

/*
* Middleware to handle logging the request and results of request afterwards. Context object is apparently stateful 
*/
export async function afterRouteLogicMiddleware(c: Context, next: Next) {
	console.log("context before is: ", c.get("teamId"))
	await next();
	console.log("context after is: ", c.get("teamId"))
}