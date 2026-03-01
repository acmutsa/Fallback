import { userToTeam, db, and, eq, log, team, teamJoinRequest } from "db";
import type { UserType, SiteRoleType } from "db/types";
import type { LoggingOptions, LoggingType } from "../types";
import { type Context } from "hono";
import { isInDevMode } from ".";

/**
 * Checks if a user has site admin privileges.
 * @param permissionEnum - The user's site role
 * @returns True if the user is an ADMIN or SUPER_ADMIN, false otherwise
 */
export function isSiteAdminUser(
	permissionEnum: NonNullable<UserType>["siteRole"],
): boolean {
	return ["ADMIN", "SUPER_ADMIN"].some((role) => role === permissionEnum);
}

/**
 * Retrieves a team by its ID from the database.
 * @param teamId - The unique identifier of the team
 * @returns The team object if found, undefined otherwise
 */
export async function findTeam(teamId: string) {
	return db.query.team.findFirst({
		where: eq(team.id, teamId),
	});
}

/**
 * Removes a user from a team by deleting their userToTeam relationship.
 * @param userId - The unique identifier of the user
 * @param teamId - The unique identifier of the team
 * @returns The teamId that was deleted
 */
export async function leaveTeam(userId: string, teamId: string) {
	return db
		.delete(userToTeam)
		.where(
			and(eq(userToTeam.userId, userId), eq(userToTeam.teamId, teamId)),
		)
		.returning({ teamId: userToTeam.teamId });
}

/**
 * Retrieves the admin relationship between a user and a team.
 * @param userId - The unique identifier of the user
 * @param teamId - The unique identifier of the team
 * @returns The userToTeam record if the user is an admin of the team, undefined otherwise
 */
export async function getAdminUserForTeam(userId: string, teamId: string) {
	return db.query.userToTeam.findFirst({
		where: and(
			eq(userToTeam.userId, userId),
			eq(userToTeam.teamId, teamId),
			eq(userToTeam.role, "ADMIN"),
		),
	});
}

/**
 * Retrieves a specific team join request by ID, user ID, and team ID.
 * @param requestId - The unique identifier of the join request
 * @param userId - The unique identifier of the user who made the request
 * @param teamId - The unique identifier of the team
 * @returns The join request record if found, undefined otherwise
 */
export async function getJoinTeamRequest(
	requestId: string,
	userId: string,
	teamId: string,
) {
	return db.query.teamJoinRequest.findFirst({
		where: and(
			eq(teamJoinRequest.id, requestId),
			eq(teamJoinRequest.userId, userId),
			eq(teamJoinRequest.teamId, teamId),
		),
	});
}

/**
 * Retrieves a team join request by ID and team ID (admin view).
 * Does not require user ID validation.
 * @param requestId - The unique identifier of the join request
 * @param teamId - The unique identifier of the team
 * @returns The join request record if found, undefined otherwise
 */
export async function getJoinTeamRequestAdmin(
	requestId: string,
	teamId: string,
) {
	return db.query.teamJoinRequest.findFirst({
		where: and(
			eq(teamJoinRequest.id, requestId),
			eq(teamJoinRequest.teamId, teamId),
		),
	});
}

/**
 * Checks if a user is a site admin OR if a provided query returns a truthy result.
 * Useful for authorization checks that can shortcut if the user is already a site admin.
 *
 * @param userSiteRole - The site role of the user
 * @param query - Either a Promise that resolves to a permission check result, or a function that returns such a Promise
 * @returns True if the user is a site admin or if the query resolves to a truthy value, false otherwise
 */
export async function isUserSiteAdminOrQueryHasPermissions<T = unknown>(
	userSiteRole: SiteRoleType,
	// Accept either a Promise (already invoked query) or a function that returns a Promise
	query: Promise<T> | (() => Promise<T>),
): Promise<boolean> {
	if (isSiteAdminUser(userSiteRole)) {
		return true;
	}

	const result = typeof query === "function" ? await query() : await query;
	return !!result;
}

/**
 * Logs an error message to the database with context information.
 * @param message - The error message to log
 * @param c - Optional Hono context for extracting request metadata
 */
export async function logError(message: string, c?: Context) {
	const options = getAllContextValues(c);
	await logToDb("ERROR", message, options);
}

/**
 * Logs an info message to the database with context information.
 * @param message - The info message to log
 * @param c - Optional Hono context for extracting request metadata
 */
export async function logInfo(message: string, c?: Context) {
	const options = getAllContextValues(c);
	await logToDb("INFO", message, options);
}

/**
 * Logs a warning message to the database with context information.
 * @param message - The warning message to log
 * @param c - Optional Hono context for extracting request metadata
 */
export async function logWarning(message: string, c?: Context) {
	const options = getAllContextValues(c);
	await logToDb("WARNING", message, options);
}

/**
 * Inserts a log record into the database. In development mode, logs to console instead.
 * Silently fails if database insertion fails to prevent cascading errors.
 * @param loggingType - The type of log (ERROR, INFO, WARNING, etc.)
 * @param message - The log message
 * @param options - Optional logging metadata (user ID, team ID, route, request ID)
 */
export async function logToDb(
	loggingType: LoggingType,
	message: string,
	options?: LoggingOptions,
) {
	if (isInDevMode()) {
		console.log(`[${loggingType}] - ${message} - Options: `, options);
		return;
	}
	try {
		await db.insert(log).values({
			...options,
			logType: loggingType,
			message,
		});
	} catch (e) {
		// Silently fail if logging to the db fails.
		console.error("Failed to log to database: ", e);
	}
}

/**
 * Extracts relevant context values from a Hono request context for logging purposes.
 * @param c - Optional Hono context
 * @returns An object containing route, userId, teamId, and requestId, or undefined if no context provided
 */
function getAllContextValues(c?: Context): LoggingOptions | undefined {
	if (!c) {
		return undefined;
	}
	const user = c.get("user") as UserType;
	return {
		route: c.req.path,
		userId: user?.id || null,
		teamId: c.get("teamId"),
		requestId: c.get("requestId"),
	};
}

/**
 * Safely extract an error code string from an unknown thrown value from a db error.
 * Returns the code as a string when present, otherwise null.
 * @param e - The unknown error object thrown from a database operation
 */
export function maybeGetDbErrorCode(e: unknown): string | null {
	if (e == null) return null;
	if (typeof e === "object") {
		const anyE = e as Record<string, unknown>;

		const errorCauseKey = anyE["cause"];
		if (errorCauseKey && typeof errorCauseKey === "object") {
			const codeKey = (errorCauseKey as Record<string, unknown>)["code"];
			if (typeof codeKey === "string") {
				return codeKey;
			} else if (typeof codeKey === "number") {
				return codeKey.toString();
			}
		}
	}

	return null;
}
