import { db, eq } from ".";
import { userToTeam } from ".";

export async function getUserTeamsQuery(userId: string) {
	return db.query.userToTeam.findMany({
		with: {
			team: true,
		},
		where: eq(userToTeam.userId, userId),
	});
}
