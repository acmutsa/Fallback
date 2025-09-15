import { env } from "../../env";

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
