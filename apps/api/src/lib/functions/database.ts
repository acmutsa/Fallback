import { userToTeam, db, and, eq, log } from "db";
import { UserType, LoggingOptions, LoggingType } from "../types";
import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query";

/**
 *
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
 *
 */
export async function pingDatabase() {}

export function isSiteAdminUser(permissionEnum:NonNullable<UserType>["siteRole"]):boolean{
	return ["ADMIN", "SUPER_ADMIN"].some(role => role === permissionEnum);
}

export async function leaveTeam(userId:string, teamId:string){
	await db
		.delete(userToTeam)
		.where(
			and(eq(userToTeam.userId, userId), eq(userToTeam.teamId, teamId)),
		);
}

export async function getAdminUserForTeam(userId:string, teamId:string){
	return db.query.userToTeam.findFirst({
				where: and(
					eq(userToTeam.userId, userId),
					eq(userToTeam.teamId, teamId),
					eq(userToTeam.role, "ADMIN")
			),
			});
}

// TODO: Come back and make this a generic function that can take in any sqlite query function
export async function isUserSiteAdminOrQueryHasPermissions(
	user: NonNullable<UserType>,
	query: SQLiteRelationalQuery,
): Promise<boolean> {
	return isSiteAdminUser(user.siteRole) || (await asyncCallBack())
		? true
		: false;
}

export async function logError(message:string, options?:LoggingOptions){
	await logToDb({ logType: "ERROR" }, message, options);
}

export async function logInfo(message:string, options?:LoggingOptions){
	await logToDb({ logType: "INFO" }, message, options);
}

export async function logWarning(message:string, options?:LoggingOptions){
	await logToDb({ logType: "WARNING" }, message, options);
}


export async function logToDb(loggingType:LoggingType, message:string, options?:LoggingOptions){
	await db.insert(log).values({
		...options,
		logType:loggingType.logType,
		message,
	})
}

