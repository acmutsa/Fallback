// TODO(https://github.com/acmutsa/Fallback/issues/35): Come back and finish team routes
import { zValidator } from "@hono/zod-validator";
import { HonoBetterAuth } from "../lib/functions";
import {
	db,
	eq,
	and,
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
			return c.json(
				{
					message: "Please log in.",
					code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
				},
				401,
			);
		}
		const userTeams = await getUserTeamsQuery(user.id);
		return c.json({ message: userTeams }, 200);
	})
	// Retrieve all of the teams
	.get("/admin", async (c) => {
		const user = c.get("user");
		if (!user || !isSiteAdminUser(user.siteRole)) {
			return c.json(
				{
					message: "Please log in.",
					code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
				},
				401,
			);
		}

		const allTeams = await db.query.team.findMany();
		return c.json({ message: allTeams }, 200);
	})
	// Retrieve all of the teams
	.get("/admin", async (c) => {
		const user = c.get("user");
		if (!user || !isSiteAdminUser(user.siteRole)) {
			return c.json(
				{
					message: "You are not authorized to access this endpoint.",
					code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
				},
				403,
			);
		}

		const allTeams = await db.query.team.findMany();
		return c.json({ data: allTeams }, 200);
	})
	.post("/join", zValidator("query", joinTeamSchema), async (c) => {
		const inv = c.req.valid("query").inv;
		const user = c.get("user");

		if (!user) {
			return c.json(
				{
					message: "Please log in.",
					code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
				},
				401,
			);
		}

		if (!inv) {
			return c.json(
				{
					message: "Invite code is required to join a team.",
					code: API_ERROR_MESSAGES.NO_INVITE_CODE,
				},
				400,
			);
		}
		const inviteRequest = await db.query.teamInvite.findFirst({
			where: and(
				eq(teamInvite.id, inv),
				eq(teamInvite.email, user.email),
			),
		});

		if (!inviteRequest) {
			return c.json(
				{
					message: "Invite code not found for this email.",
					code: API_ERROR_MESSAGES.CODE_NOT_FOUND,
				},
				400,
			);
		}

		if (inviteRequest.acceptedAt) {
			return c.json(
				{
					message: "User is already a member of this team.",
					code: API_ERROR_MESSAGES.ALREADY_MEMBER,
				},
				400,
			);
		}
		// Check if the invite has expired
		if (inviteRequest.expiresAt && isPast(inviteRequest.expiresAt)) {
			return c.json(
				{
					message: "Invite code has expired.",
					code: API_ERROR_MESSAGES.CODE_EXPIRED,
				},
				400,
			);
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
				logWarning(
					`User with ID ${user.id} is already a member of team with ID ${inviteRequest.teamId}. Transaction has been rolled back.`,
					c,
				);
				return c.json(
					{
						message: "User is already a member of this team.",
						code: API_ERROR_MESSAGES.ALREADY_MEMBER,
					},
					400,
				);
			}
			logError(
				`Error occurred while user with ID ${user.id} was attempting to join team with ID ${inviteRequest.teamId}. Transaction has been rolled back. Error details: ${e}`,
				c,
			);
			return c.json(
				{
					message:
						"An error occurred while attempting to join the team. Please try again later.",
					code: API_ERROR_MESSAGES.GENERIC_ERROR,
				},
				500,
			);
		}

		const teamInfo = await db.query.team.findFirst({
			where: eq(team.id, inviteRequest.teamId),
		});
		if (!teamInfo) {
			logError(
				`Team with ID ${inviteRequest.teamId} not found after accepting invite. This should not happen and indicates a critical issue. Please investigate immediately.`,
				c,
			);
			return c.json(
				{
					message:
						"Team not found after accepting invite. Please contact support.",
					code: API_ERROR_MESSAGES.NOT_FOUND,
				},
				500,
			);
		}

		return c.json({ data: teamInfo }, 200);
	})
	.get("/:teamId", zValidator("param", teamIdSchema), async (c) => {
		const teamId = c.req.valid("param").teamId;
		const user = c.get("user");

		c.set("teamId", teamId);

		if (!user) {
			return c.json(
				{
					message: "Please log in.",
					code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
				},
				401,
			);
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
				{
					message:
						"You cannot view this team. Please contact your administrator if you believe this is an error.",
					code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
				},
				403,
			);
		}

		const teamInfo = await db.query.team.findFirst({
			where: eq(team.id, teamId),
		});

		if (!teamInfo) {
			return c.json(
				{
					message: "Team not found.",
					code: API_ERROR_MESSAGES.NOT_FOUND,
				},
				404,
			);
		}

		return c.json({ data: teamInfo }, 200);
	})
	// Not too sure if we should enhance this. Perhaps mark it for deletion instead and allow the users to recover it?
	.delete("/:teamId", zValidator("param", teamIdSchema), async (c) => {
		const user = c.get("user");
		const teamId = c.req.valid("param").teamId;

		if (!user) {
			return c.json(
				{
					message: "Please log in.",
					code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
				},
				401,
			);
		}

		const canUserDelete = await isUserSiteAdminOrQueryHasPermissions(
			user.siteRole,
			getAdminUserForTeam(user.id, teamId),
		);

		if (!canUserDelete) {
			return c.json(
				{
					message:
						"You cannot delete this team. Please contact your administrator if you believe this is an error.",
					code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
				},
				401,
			);
		}

		const deletedTeamData = await db
			.delete(team)
			.where(eq(team.id, teamId))
			.returning();

		if (deletedTeamData.length === 0) {
			return c.json(
				{
					message: "Team not found.",
					code: API_ERROR_MESSAGES.NOT_FOUND,
				},
				404,
			);
		}

		return c.json({ data: deletedTeamData[0] }, 200);
	})
	.get("/:teamId/admin", zValidator("param", teamIdSchema), async (c) => {
		const teamId = c.req.valid("param").teamId;
		const user = c.get("user");

		if (!user) {
			return c.json(
				{
					message: "Please log in.",
					code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
				},
				401,
			);
		}

		// Either team or site admins can view so we need to check.
		const canUserView = await isUserSiteAdminOrQueryHasPermissions(
			user.siteRole,
			getAdminUserForTeam(user.id, teamId),
		);

		if (!canUserView) {
			return c.json(
				{
					message:
						"You cannot view this team. Please contact your administrator if you believe this is an error.",
					code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
				},
				403,
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
			return c.json(
				{
					message: "Team not found.",
					code: API_ERROR_MESSAGES.NOT_FOUND,
				},
				404,
			);
		}

		return c.json({ data: allTeamInfo }, 200);
	})
	.get("/:teamId/members", zValidator("param", teamIdSchema), async (c) => {
		const teamId = c.req.valid("param").teamId;
		const user = c.get("user");

		if (!user) {
			return c.json(
				{
					message: "Please log in.",
					code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
				},
				401,
			);
		}
		const canUserView = await isUserSiteAdminOrQueryHasPermissions(
			user.siteRole,
			getAdminUserForTeam(user.id, teamId),
		);

		if (!canUserView) {
			return c.json(
				{
					message:
						"You cannot view this team's members. Please contact your administrator if you believe this is an error.",
					code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
				},
				403,
			);
		}

		const teamMembers = await db.query.team.findFirst({
			where: eq(team.id, teamId),
			with: {
				members: true,
			},
		});

		if (!teamMembers) {
			return c.json(
				{
					message: "Team not found.",
					code: API_ERROR_MESSAGES.NOT_FOUND,
				},
				404,
			);
		}

		return c.json({ data: teamMembers }, 200);
	})
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
					{
						message: "Please log in.",
						code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
					},
					401,
				);
			}

			const canUserUpdate = await isUserSiteAdminOrQueryHasPermissions(
				user.siteRole,
				getAdminUserForTeam(user.id, teamId),
			);

			if (!canUserUpdate) {
				return c.json(
					{
						message:
							"You cannot update this team. Please contact your administrator if you believe this is an error.",
						code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
					},
					403,
				);
			}

			const newTeamData = await db
				.update(team)
				.set({
					name: newTeamNameSchema.name,
				})
				.where(eq(team.id, teamId))
				.returning();

			if (newTeamData.length === 0) {
				return c.json(
					{
						message: "Team not found.",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					404,
				);
			}

			return c.json({ data: newTeamData[0] }, 200);
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
					{
						message: "Please log in.",
						code: API_ERROR_MESSAGES.NOT_AUTHENTICATED,
					},
					401,
				);
			}

			// Users can remove themselves at any time.
			const isUserAttemptingToRemoveThemselves =
				userIdToRemove === user.id;

			const canUserRemove = await isUserSiteAdminOrQueryHasPermissions(
				user.siteRole,
				getAdminUserForTeam(user.id, teamId),
			);

			if (isUserAttemptingToRemoveThemselves || canUserRemove) {
				const teamIdUserRemovedFrom = await leaveTeam(
					userIdToRemove,
					teamId,
				);
				if (teamIdUserRemovedFrom.length === 0) {
					return c.json(
						{
							message: "Team or user not found.",
							code: API_ERROR_MESSAGES.NOT_FOUND,
						},
						404,
					);
				}
				return c.json({ data: teamIdUserRemovedFrom[0] }, 200);
			} else {
				return c.json(
					{
						message:
							"You cannot remove this user from the team. Please contact your administrator if you believe this is an error.",
						code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
					},
					403,
				);
			}
		},
	);
export default teamHandler;
