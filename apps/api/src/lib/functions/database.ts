import { userToTeam, db, and, eq, log, team, teamJoinRequest } from "db";
import type { UserType, SiteRoleType } from "db/types";
import type { LoggingOptions, LoggingType } from "../types";
import { type Context } from "hono";
import { isInDevMode } from ".";

export function isSiteAdminUser(
	permissionEnum: NonNullable<UserType>["siteRole"],
): boolean {
	return ["ADMIN", "SUPER_ADMIN"].some((role) => role === permissionEnum);
}

export async function findTeam(teamId: string) {
	return db.query.team.findFirst({
		where: eq(team.id, teamId),
	});
}

export async function leaveTeam(userId: string, teamId: string) {
	return db
		.delete(userToTeam)
		.where(
			and(eq(userToTeam.userId, userId), eq(userToTeam.teamId, teamId)),
		)
		.returning({ teamId: userToTeam.teamId });
}

export async function getAdminUserForTeam(userId: string, teamId: string) {
	return db.query.userToTeam.findFirst({
		where: and(
			eq(userToTeam.userId, userId),
			eq(userToTeam.teamId, teamId),
			eq(userToTeam.role, "ADMIN"),
		),
	});
}

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

// TODO: This function is lowkey pivotal so we should ensure it is WAI.
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

export async function logError(message: string, c?: Context) {
	const options = getAllContextValues(c);
	await logToDb("ERROR", message, options);
}

export async function logInfo(message: string, c?: Context) {
	const options = getAllContextValues(c);
	await logToDb("INFO", message, options);
}

export async function logWarning(message: string, c?: Context) {
	const options = getAllContextValues(c);
	await logToDb("WARNING", message, options);
}

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
 *
 * This function can handle it being passed as either a number or string and will convert if need be
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
