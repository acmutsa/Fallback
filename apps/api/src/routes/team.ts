import { zValidator } from "@hono/zod-validator";
import { HonoBetterAuth } from "../lib/functions";
import {
	db,
	eq,
	and,
	gte,
	isNull,
	getUserTeamsQuery,
	userToTeam,
	teamInvite,
	team,
} from "db";
import {
	joinTeamSchema,
	userTeamActionSchema,
	teamIdValidator,
	teamNameValidator,
} from "shared/zod";
import { API_ERROR_MESSAGES } from "shared";
import {
	leaveTeam,
	getAdminUserForTeam,
	isUserSiteAdminOrQueryHasPermissions,
} from "../lib/functions/database";
import { isSiteAdminUser } from "../lib/functions/database";

/*
 * Routes made to handle thr logic related to teams.
 * Context of a teamId should be set when possible for the sake of logging.
 */
const teamHandler = HonoBetterAuth()
	.get("/", async (c) => {
		const user = c.get("user");
		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}
		const userTeams = await getUserTeamsQuery(user.id);
		return c.json({ message: userTeams }, 200);
	})
	// Retrieve all of the teams
	.get("/admin", async (c) => {
		const user = c.get("user");
		if (!user || !isSiteAdminUser(user.siteRole)) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}

		const allTeams = await db.query.team.findMany();
		return c.json({ message: allTeams }, 200);
	})
	.post("/join", zValidator("query", joinTeamSchema), async (c) => {
		const inv = c.req.query("inv");
		const user = c.get("user");

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}

		if (!inv) {
			return c.json({ message: API_ERROR_MESSAGES.noInviteCode }, 400);
		}

		const compDate = new Date(Date.now());

		const inviteRequest = await db.query.teamInvite.findFirst({
			where: and(
				eq(teamInvite.id, inv),
				eq(teamInvite.email, user.email),
				isNull(teamInvite.acceptedAt),
				gte(teamInvite.expiresAt, compDate),
			),
		});

		if (!inviteRequest) {
			return c.json({ messsage: API_ERROR_MESSAGES.codeNotFound }, 400);
		}

		c.set("teamId", inviteRequest.teamId);

		await db.transaction(async (tx) => {
			await tx.insert(userToTeam).values({
				teamId: inviteRequest.teamId,
				userId: user.id,
				role: inviteRequest.role,
			});

			// TODO: Look and see if we can do this after the function has been sent
			await tx
				.update(teamInvite)
				.set({
					acceptedAt: compDate,
				})
				.where(eq(teamInvite.id, inv));
		});

		return c.json({ message: "invite_code_success" }, 200);
	})
	.get("/:teamId", zValidator("param", teamIdValidator), async (c) => {
		const teamId = c.req.param("teamId");
		const user = c.get("user");

		c.set("teamId", teamId);

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}
		const asyncCallback = db.query.userToTeam.findFirst({
			where: and(
				eq(userToTeam.teamId, teamId),
				eq(userToTeam.userId, user.id),
			),
		});
		const canUserView = await isUserSiteAdminOrQueryHasPermissions(
			user.siteRole,
			asyncCallback,
		);

		if (!canUserView) {
			return c.json(
				{ message: API_ERROR_MESSAGES.invalidPermissions },
				401,
			);
		}

		const teamInfo = await db.query.team.findFirst({
			where: eq(team.id, teamId),
		});

		if (!teamInfo) {
			return c.json({ message: API_ERROR_MESSAGES.notFound }, 404);
		}

		return c.json({ message: teamInfo }, 200);
	})
	// Not too sure if we should enhance this. Perhaps mark it for deletion instead and allow the users to recover it?
	.delete("/:teamId", zValidator("param", teamIdValidator), async (c) => {
		const user = c.get("user");
		const teamId = c.req.param("teamId");

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}

		const canUserDelete = await isUserSiteAdminOrQueryHasPermissions(
			user.siteRole,
			getAdminUserForTeam(user.id, teamId),
		);

		if (!canUserDelete) {
			return c.json(
				{ message: API_ERROR_MESSAGES.invalidPermissions },
				401,
			);
		}

		await db.delete(team).where(eq(team.id, teamId));

		return c.json({ message: "Success" }, 200);
	})
	.get("/:teamId/admin", zValidator("param", teamIdValidator), async (c) => {
		const teamId = c.req.param("teamId");
		const user = c.get("user");

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}

		const canUserView = isUserSiteAdminOrQueryHasPermissions(
			user.siteRole,
			getAdminUserForTeam(user.id, teamId),
		);

		if (!canUserView) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized });
		}

		const allTeamInfo = db.query.team.findFirst({
			where: eq(team.id, teamId),
			with: {
				members: true,
				backupJobs: true,
				invites: true,
				logs: true,
			},
		});

		return c.json({ message: allTeamInfo }, 200);
	})
	.get(
		"/:teamId/members",
		zValidator("param", teamIdValidator),
		async (c) => {
			const teamId = c.req.param("teamId");
			const user = c.get("user");

			if (!user) {
				return c.json(
					{ message: API_ERROR_MESSAGES.notAuthorized },
					401,
				);
			}
			const canUserView = await isUserSiteAdminOrQueryHasPermissions(
				user.siteRole,
				getAdminUserForTeam(user.id, teamId),
			);

			if (!canUserView) {
				return c.json(
					{ message: API_ERROR_MESSAGES.invalidPermissions },
					401,
				);
			}

			const teamMembers = await db.query.team.findMany({
				where: eq(team.id, teamId),
				with: {
					members: true,
				},
			});

			return c.json({ message: teamMembers }, 200);
		},
	)
	// TODO: I think this is wrong
	.patch(
		"/:teamId/update",
		zValidator("param", teamIdValidator),
		zValidator("form", teamNameValidator),
		async (c) => {
			const user = c.get("user");
			const teamId = c.req.param("teamId");
			const newTeamName = c.req.valid("form");

			if (!user) {
				return c.json(
					{ message: API_ERROR_MESSAGES.notAuthorized },
					401,
				);
			}

			const canUserUpdate = await isUserSiteAdminOrQueryHasPermissions(
				user.siteRole,
				getAdminUserForTeam(user.id, teamId),
			);

			if (!canUserUpdate) {
				return c.json(
					{ message: API_ERROR_MESSAGES.invalidPermissions },
					401,
				);
			}

			await db
				.update(team)
				.set({
					name: newTeamName,
				})
				.where(eq(team.id, teamId));

			return c.json({ message: "Success" }, 200);
		},
	)
	.delete(
		"/:teamId/:userId/remove",
		zValidator("param", userTeamActionSchema),
		async (c) => {
			const teamId = c.req.param("teamId");
			const userIdToRemove = c.req.param("userId");
			const user = c.get("user");

			if (!user) {
				return c.json(
					{ messsage: API_ERROR_MESSAGES.notAuthorized },
					401,
				);
			}

			// If the user is attempting to remove themselves, we will allow this.
			if (userIdToRemove === user.id) {
				await leaveTeam(user.id, teamId);

				return c.json(
					{ message: "Successfully removed from team." },
					200,
				);
			}

			// If not, we know that it is a user attempting to remove another user and we need to ensure they have the right permissions for this.

			const canUserRemove = await isUserSiteAdminOrQueryHasPermissions(
				user.siteRole,
				getAdminUserForTeam(user.id, teamId),
			);

			if (!canUserRemove) {
				return c.json(
					{ message: API_ERROR_MESSAGES.invalidPermissions },
					401,
				);
			}

			// Lastly, if they are good, we can finally remove the user
			await leaveTeam(userIdToRemove, teamId);

			return c.json({ message: "Success" }, 200);
		},
	);
export default teamHandler;
