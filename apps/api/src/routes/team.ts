// TODO(https://github.com/acmutsa/Fallback/issues/45): Come back and make sure we only send the data the user needs
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
	teamJoinRequest,
	desc,
} from "db";
import {
	joinTeamSchema,
	userTeamActionSchema,
	teamIdSchema,
	teamNameSchema,
	teamRequestSchema,
} from "shared/zod";
import { API_ERROR_MESSAGES } from "shared";
import {
	leaveTeam,
	getAdminUserForTeam,
	isUserSiteAdminOrQueryHasPermissions,
	logError,
	logWarning,
	maybeGetDbErrorCode,
	findTeamUserFacing,
	getJoinTeamRequest,
	getJoinTeamRequestAdmin,
	findTeam,
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
		return c.json({ data: userTeams }, 200);
	})
	// Retrieve all of the teams
	.get("/admin", async (c) => {
		const user = c.get("user");
		if (!user || !isSiteAdminUser(user.siteRole)) {
			return c.json(
				{
					message:
						"You do not have permission to access this resource.",
					code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
				},
				403,
			);
		}

		const allTeams = await db.query.team.findMany();
		return c.json({ data: allTeams }, 200);
	})
	.post(
		"/invites/:inviteId/accept",
		zValidator("param", joinTeamSchema),
		async (c) => {
			const inv = c.req.valid("param").inviteId;
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

			const invite = await db.query.teamInvite.findFirst({
				where: and(
					eq(teamInvite.id, inv),
					eq(teamInvite.email, user.email),
				),
			});

			if (!invite) {
				return c.json(
					{
						message: "Invite code not found for this email.",
						code: API_ERROR_MESSAGES.CODE_NOT_FOUND,
					},
					400,
				);
			}

			if (invite.acceptedAt) {
				return c.json(
					{
						message: "Invite code has already been used.",
						code: API_ERROR_MESSAGES.INVITE_CODE_USED,
					},
					400,
				);
			}
			// Check if the invite has expired
			if (invite.expiresAt && isPast(invite.expiresAt)) {
				return c.json(
					{
						message: "Invite code has expired.",
						code: API_ERROR_MESSAGES.CODE_EXPIRED,
					},
					400,
				);
			}

			c.set("teamId", invite.teamId);

			try {
				await db.transaction(async (tx) => {
					await tx.insert(userToTeam).values({
						teamId: invite.teamId,
						userId: user.id,
						role: invite.role,
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
						`User with ID ${user.id} is already a member of team with ID ${invite.teamId}. Transaction has been rolled back.`,
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
					`Error occurred while user with ID ${user.id} was attempting to join team with ID ${invite.teamId}. Transaction has been rolled back. Error details: ${e}`,
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

			return c.json(
				{ data: { teamId: invite.teamId, role: invite.role } },
				200,
			);
		},
	)
	.get("/requests", async (c) => {
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

		const teamJoinRequests = await db.query.teamJoinRequest.findMany({
			columns: {
				userId: false,
				teamId: false,
			},
			where: eq(teamJoinRequest.userId, user.id),
			with: {
				team: {
					columns: {
						updatedAt: false,
						createdAt: false,
					},
				},
			},
			orderBy: desc(teamJoinRequest.createdAt),
		});

		return c.json({ data: teamJoinRequests }, 200);
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
	.get("/:teamId/requests", zValidator("param", teamIdSchema), async (c) => {
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
						"You cannot view this team's join requests. Please contact your administrator if you believe this is an error.",
					code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
				},
				403,
			);
		}

		const joinRequests = await db.query.teamJoinRequest.findMany({
			where: eq(teamJoinRequest.teamId, teamId),
			with: {
				user: {
					columns: {
						firstName: true,
						lastName: true,
						id: true,
						image: true,
					},
				},
			},
			orderBy: desc(teamJoinRequest.createdAt),
		});

		return c.json({ data: joinRequests }, 200);
	})
	.post("/:teamId/requests", zValidator("param", teamIdSchema), async (c) => {
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

		const doesTeamExist = await findTeam(teamId);

		if (!doesTeamExist) {
			return c.json(
				{
					message: "Team not found.",
					code: API_ERROR_MESSAGES.NOT_FOUND,
				},
				404,
			);
		}

		const existingRequest = await db.query.teamJoinRequest.findFirst({
			where: and(
				eq(teamJoinRequest.teamId, teamId),
				eq(teamJoinRequest.userId, user.id),
				eq(teamJoinRequest.status, "PENDING"),
			),
		});

		if (existingRequest) {
			return c.json(
				{
					message:
						"You already have a pending join request for this team.",
					code: API_ERROR_MESSAGES.JOIN_REQUEST_EXISTS,
				},
				400,
			);
		}

		const isUserAlreadyMember = await db.query.userToTeam.findFirst({
			where: and(
				eq(userToTeam.teamId, teamId),
				eq(userToTeam.userId, user.id),
			),
		});

		if (isUserAlreadyMember) {
			return c.json(
				{
					message: "You are already a member of this team.",
					code: API_ERROR_MESSAGES.ALREADY_MEMBER,
				},
				400,
			);
		}

		const newJoinRequest = await db
			.insert(teamJoinRequest)
			.values({
				teamId,
				userId: user.id,
			})
			.returning();

		return c.json({ data: { requestId: newJoinRequest[0].id } }, 200);
	})
	.post(
		"/:teamId/requests/:requestId/approve",
		zValidator("param", teamRequestSchema),
		async (c) => {
			const { teamId, requestId } = c.req.valid("param");
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

			const canUserApprove = await isUserSiteAdminOrQueryHasPermissions(
				user.siteRole,
				getAdminUserForTeam(user.id, teamId),
			);

			if (!canUserApprove) {
				return c.json(
					{
						message:
							"You cannot approve join requests for this team. Please contact your administrator if you believe this is an error.",
						code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
					},
					403,
				);
			}

			const joinRequest = await getJoinTeamRequestAdmin(
				requestId,
				teamId,
			);

			if (!joinRequest) {
				return c.json(
					{
						message: "Join request not found.",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					404,
				);
			}

			if (joinRequest.status === "APPROVED") {
				return c.json(
					{
						message: "Join request has already been approved.",
						code: API_ERROR_MESSAGES.ALREADY_APPROVED,
					},
					400,
				);
			} else if (joinRequest.status === "REJECTED") {
				return c.json(
					{
						message: "Join request has already been rejected.",
						code: API_ERROR_MESSAGES.REJECTED,
					},
					400,
				);
			} else if (joinRequest.status === "RESCINDED") {
				return c.json(
					{
						message: "Join request has been rescinded by the user.",
						code: API_ERROR_MESSAGES.RESCINDED,
					},
					400,
				);
			}

			try {
				await db.transaction(async (tx) => {
					await tx.insert(userToTeam).values({
						teamId,
						userId: joinRequest.userId,
						role: "MEMBER",
					});

					await tx
						.update(teamJoinRequest)
						.set({
							status: "APPROVED",
						})
						.where(eq(teamJoinRequest.id, requestId));
				});
			} catch (e) {
				const errorCode = maybeGetDbErrorCode(e);
				if (errorCode === "SQLITE_CONSTRAINT") {
					logWarning(
						`User with ID ${joinRequest.userId} is already a member of team with ID ${joinRequest.teamId}. Transaction has been rolled back.`,
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
					`Error occurred while user with ID ${joinRequest.userId} was attempting to accept join request for team with ID ${joinRequest.teamId}. Transaction has been rolled back. Error details: ${e}`,
					c,
				);
				return c.json(
					{
						message:
							"An error occurred while attempting to accept the join request for the team. Please try again later.",
						code: API_ERROR_MESSAGES.GENERIC_ERROR,
					},
					500,
				);
			}

			const teamInfo = await findTeamUserFacing(joinRequest.teamId);
			if (!teamInfo) {
				logError(
					`Team with ID ${joinRequest.teamId} not found after accepting join request. This should not happen and indicates a critical issue. Please investigate immediately.`,
					c,
				);
				return c.json(
					{
						message:
							"Team not found after accepting join request. Please contact support.",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					500,
				);
			}

			return c.json({ data: teamInfo }, 200);
		},
	)
	.post(
		"/:teamId/requests/:requestId/reject",
		zValidator("param", teamRequestSchema),
		async (c) => {
			const { teamId, requestId } = c.req.valid("param");
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

			const canUserReject = await isUserSiteAdminOrQueryHasPermissions(
				user.siteRole,
				getAdminUserForTeam(user.id, teamId),
			);

			if (!canUserReject) {
				return c.json(
					{
						message:
							"You cannot reject join requests for this team. Please contact your administrator if you believe this is an error.",
						code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
					},
					403,
				);
			}

			const joinRequest = await getJoinTeamRequestAdmin(
				requestId,
				teamId,
			);

			if (!joinRequest) {
				return c.json(
					{
						message: "Join request not found.",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					404,
				);
			}

			if (joinRequest.status === "APPROVED") {
				return c.json(
					{
						message: "Request has already been approved.",
						code: API_ERROR_MESSAGES.ALREADY_MEMBER,
					},
					400,
				);
			} else if (joinRequest.status === "REJECTED") {
				return c.json(
					{
						message: "Request has already been rejected.",
						code: API_ERROR_MESSAGES.REJECTED,
					},
					400,
				);
			} else if (joinRequest.status === "RESCINDED") {
				return c.json(
					{
						message: "Request has been rescinded by the user.",
						code: API_ERROR_MESSAGES.REJECTED,
					},
					400,
				);
			}

			const rejectedRequest = await db
				.update(teamJoinRequest)
				.set({
					status: "REJECTED",
				})
				.where(eq(teamJoinRequest.id, requestId))
				.returning();

			if (rejectedRequest.length === 0) {
				return c.json(
					{
						message: "Join request not found.",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					404,
				);
			}

			return c.json(
				{ data: { joinRequestId: rejectedRequest[0].id } },
				200,
			);
		},
	)
	.post(
		"/:teamId/requests/:requestId/rescind",
		zValidator("param", teamRequestSchema),
		async (c) => {
			const { teamId, requestId } = c.req.valid("param");
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

			const joinRequest = await getJoinTeamRequest(
				requestId,
				user.id,
				teamId,
			);

			if (!joinRequest) {
				return c.json(
					{
						message: "Join request not found.",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					404,
				);
			}

			if (joinRequest.status === "APPROVED") {
				return c.json(
					{
						message:
							"Join request has already been approved and cannot be rescinded.",
						code: API_ERROR_MESSAGES.ALREADY_MEMBER,
					},
					400,
				);
			} else if (joinRequest.status === "REJECTED") {
				return c.json(
					{
						message:
							"Join request has already been rejected and cannot be rescinded.",
						code: API_ERROR_MESSAGES.REJECTED,
					},
					400,
				);
			} else if (joinRequest.status === "RESCINDED") {
				return c.json(
					{
						message: "Join request has already been rescinded.",
						code: API_ERROR_MESSAGES.REJECTED,
					},
					400,
				);
			}

			const rescindedRequest = await db
				.update(teamJoinRequest)
				.set({
					status: "RESCINDED",
				})
				.where(eq(teamJoinRequest.id, requestId))
				.returning();

			if (rescindedRequest.length === 0) {
				return c.json(
					{
						message: "Join request not found.",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					404,
				);
			}

			return c.json({ data: rescindedRequest[0].id }, 200);
		},
	)
	// This route should return all of the information related to a team that an admin would need. We can break it down into multiple routes if it becomes too much but for now we will just return it all.
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
