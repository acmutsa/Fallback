// TODO(https://github.com/acmutsa/Fallback/issues/35): Come back and finish team routes
import { zValidator } from "@hono/zod-validator";
import { HonoBetterAuth } from "../lib/functions";
import {
	db,
	eq,
	and,
	isNull,
	getUserTeamsQuery,
	userToTeam,
	teamInvite,
	team,
} from "db";
import {
	joinTeamSchema,
	userTeamActionSchema,
	teamIdSchema,
	teamNameSchema,
} from "shared/zod";
import { API_ERROR_MESSAGES } from "shared";
import {
	leaveTeam,
	getAdminUserForTeam,
	isUserSiteAdminOrQueryHasPermissions,
	logError,
	logWarning,
	maybeGetDbErrorCode,
} from "../lib/functions/database";
import { isSiteAdminUser } from "../lib/functions/database";
import { isPast } from "date-fns";

/*
 * Routes made to handle the logic related to teams.
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
		const inv = c.req.valid("query").inv;
		const user = c.get("user");

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}

		if (!inv) {
			return c.json({ message: API_ERROR_MESSAGES.noInviteCode }, 400);
		}
		const inviteRequest = await db.query.teamInvite.findFirst({
			where: and(
				eq(teamInvite.id, inv),
				eq(teamInvite.email, user.email),
			),
		});

		if (!inviteRequest) {
			return c.json({ message: API_ERROR_MESSAGES.codeNotFound }, 400);
		}

		if (inviteRequest.acceptedAt) {
			return c.json({ message: API_ERROR_MESSAGES.alreadyMember }, 400);
		}
		// Check if the invite has expired
		if (inviteRequest.expiresAt && isPast(inviteRequest.expiresAt)) {
			return c.json({ message: API_ERROR_MESSAGES.codeExpired }, 400);
		}

		c.set("teamId", inviteRequest.teamId);

		try {
			await db.transaction(async (tx) => {
				await tx.insert(userToTeam).values({
					teamId: inviteRequest.teamId,
					userId: user.id,
					role: inviteRequest.role,
				});

				await tx
					.update(teamInvite)
					.set({
						acceptedAt: new Date(),
					})
					.where(eq(teamInvite.id, inv));
			});
		} catch (e) {
			const errorCode = maybeGetDbErrorCode(e);
			if (errorCode === "SQLITE_CONSTRAINT") {
				await logWarning(
					`User with ID ${user.id} is already a member of team with ID ${inviteRequest.teamId}. Transaction has been rolled back.`,
					c,
				);
				return c.json(
					{ message: API_ERROR_MESSAGES.alreadyMember },
					400,
				);
			}
			await logError(
				`Error occurred while user with ID ${user.id} was attempting to join team with ID ${inviteRequest.teamId}. Transaction has been rolled back. Error details: ${e}`,
				c,
			);
			return c.json({ message: API_ERROR_MESSAGES.genericError }, 500);
		}

		const teamInfo = await db.query.team.findFirst({
			where: eq(team.id, inviteRequest.teamId),
		});
		if (!teamInfo) {
			await logError(
				`Team with ID ${inviteRequest.teamId} not found after accepting invite. This should not happen and indicates a critical issue. Please investigate immediately.`,
				c,
			);
			return c.json({ message: API_ERROR_MESSAGES.notFound }, 500);
		}

		return c.json({ message: teamInfo }, 200);
	})
	.get("/:teamId", zValidator("param", teamIdSchema), async (c) => {
		const teamId = c.req.valid("param").teamId;
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
	.delete("/:teamId", zValidator("param", teamIdSchema), async (c) => {
		const user = c.get("user");
		const teamId = c.req.valid("param").teamId;

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
	.get("/:teamId/admin", zValidator("param", teamIdSchema), async (c) => {
		const teamId = c.req.valid("param").teamId;
		const user = c.get("user");

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
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

		const allTeamInfo = await db.query.team.findFirst({
			where: eq(team.id, teamId),
			with: {
				members: true,
				backupJobs: true,
				invites: true,
				logs: true,
			},
		});

		if (!allTeamInfo) {
			return c.json({ message: API_ERROR_MESSAGES.notFound }, 404);
		}

		return c.json({ message: allTeamInfo }, 200);
	})
	.get("/:teamId/members", zValidator("param", teamIdSchema), async (c) => {
		const teamId = c.req.valid("param").teamId;
		const user = c.get("user");

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
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

		const teamMembers = await db.query.team.findFirst({
			where: eq(team.id, teamId),
			with: {
				members: true,
			},
		});

		if (!teamMembers) {
			return c.json({ message: API_ERROR_MESSAGES.notFound }, 404);
		}

		return c.json({ message: teamMembers }, 200);
	})
	// TODO: I think this is wrong
	.patch(
		"/:teamId/update",
		zValidator("param", teamIdSchema),
		zValidator("form", teamNameSchema),
		async (c) => {
			const user = c.get("user");
			const teamId = c.req.valid("param").teamId;
			const newTeamNameSchema = c.req.valid("form");

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
					name: newTeamNameSchema.name,
				})
				.where(eq(team.id, teamId));

			return c.json({ message: "Success" }, 200);
		},
	)
	.delete(
		"/:teamId/:userId/remove",
		zValidator("param", userTeamActionSchema),
		async (c) => {
			const teamId = c.req.valid("param").teamId;
			const userIdToRemove = c.req.valid("param").userId;
			const user = c.get("user");

			if (!user) {
				return c.json(
					{ message: API_ERROR_MESSAGES.notAuthorized },
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
