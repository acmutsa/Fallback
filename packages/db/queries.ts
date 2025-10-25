import { db, eq } from ".";
import { userToTeam } from ".";

export async function getUserTeamsQuery(userId: string) {
	return  db.query.team.findMany({
		with:{
      members:true,
    },
    where:eq(userToTeam.userId, userId)
	});
}
