import { zValidator } from "@hono/zod-validator";
import { HonoBetterAuth } from "../lib/functions";
import { db, eq, and, getUserTeamsQuery, userToTeam } from "db";
import { joinTeamSchema, teamIdValidator } from "shared/zod";

const teamHandler = HonoBetterAuth()
	.get("/", async (c) => {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Unauthorized" }, 401);
		}
		const userTeams = await getUserTeamsQuery(user.id);
		return c.json({ data: userTeams }, 200);
	})
	.post("/join", zValidator("query", joinTeamSchema), async (c) => {
		// First, try to join by invite code
		// If no invite code, we will try to join by team ID only if the team allows it. If not, we will render our card regardless but include an error message notifying
		// The user that the team is private and requires an invite code. The server will send back the name of the team as well in this case.
		const inv = c.req.query("inv");
		const teamId = c.req.query("teamId");
		const user = c.get("user");

		if (inv) {
			// const result
		}

		return c.json({ message: "invite_code_success" }, 200);
	})
	.post("/:teamId/leave", zValidator("param", teamIdValidator), async (c) => {
		const teamId = c.req.param("teamId");
		const user = c.get("user");

		if (!user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		// Remove user from team members and maybe come back later and invalidate all previous invites
		await db
			.delete(userToTeam)
			.where(
				and(
					eq(userToTeam.userId, user.id),
					eq(userToTeam.teamId, teamId),
				),
			);

		return c.json({ message: "left_team_success" }, 200);
	});
export default teamHandler;
