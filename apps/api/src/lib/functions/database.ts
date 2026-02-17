import { userToTeam, db, and, eq, log } from "db";
import type { UserType, SiteRoleType } from "db/types";
import type { LoggingOptions, LoggingType } from "../types";
import { type Context } from "hono";
import { isInDevMode } from ".";

/**
 * Fetches a database dump from a Turso database instance.
 * @param databseName The name of the database.
 * @param organizationSlug The organization slug associated with the database.
 * Fetches a database dump from a Turso database instance.
 * @param databseName The name of the database.
 * @param organizationSlug The organization slug associated with the database.
 */
export async function getDatabaseDumpTurso(
	databseName: string,
	organizationSlug: string,
) {
	const res = await fetch(
		`https://${databseName}-${organizationSlug}.turso.io/dump`,
		{
			method: "GET",
			headers: new Headers({
				// Authorization: `Bearer ${env.BACKUPS_DB_BEARER}`,
			}),
		},
	);

	if (!res.ok) {
		throw new Error(
			`Failed to get database dump: ${res.status} ${res.statusText}`,
		);
	}

	return res.text();
}

/**
 * Checks the database connection by pinging it and querying for it's table count.
 * Function will take in an database information and the type to make the appropriate query.
 */
export async function pingDatabase() {}

export function isSiteAdminUser(
	permissionEnum: NonNullable<UserType>["siteRole"],
): boolean {
	return ["ADMIN", "SUPER_ADMIN"].some((role) => role === permissionEnum);
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
