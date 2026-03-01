import { authClient } from "../auth-client";
import { PUBLIC_ROUTES } from "shared/constants";
import type { RouterContext } from "../types";
import { redirect } from "@tanstack/react-router";
/**
 * Checks if a given pathname is a public route.
 * @param pathname - The pathname to check
 * @returns True if the pathname is a public route, false otherwise
 */
export function isPublicRoute(pathname: string) {
	return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Checks if a given pathname is a protected route (i.e., not a public route).
 * @param pathname - The pathname to check
 * @returns True if the pathname is a protected route, false otherwise
 */
export function isProtectedRoute(pathname: string) {
	return !isPublicRoute(pathname);
}

/**
 * Retrieves the current user session from the authentication client.
 * @returns The session data if a user is authenticated, or null if not authenticated
 */
export async function getSession() {
	return authClient.getSession();
}

/**
 * Signs out the current user.
 * @returns An object containing the sign-out data and any error encountered
 */
export async function signOut() {
	const { data, error } = await authClient.signOut();
	return { data, error };
}

/**
 * Redirects the user to a specified path if they are already signed in.
 * @param ctx - The router context containing authentication information
 * @param to - The path to redirect to if the user is signed in (default is "/")
 * @throws A redirect to the specified path if the user is authenticated
 */
export function redirectIfSignedIn(ctx: RouterContext, to: string = "/") {
	if (ctx.auth?.data) {
		throw redirect({
			to,
		});
	}
}
