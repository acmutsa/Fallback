import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HonoBetterAuth } from "../lib/functions";
import { db, eq } from "db";
import { user } from "db/schema";
import { API_ERROR_MESSAGES } from "shared";
import { isSiteAdminUser } from "../lib/functions/database";

const userhandler = HonoBetterAuth()
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
		return c.json({ data: user }, 200);
	})
	// This needs a permission check. Only admins of the site should be able to see ths endpoint
	.get(
		"/admin/:userId",
		zValidator(
			"param",
			z.object({
				userId: z.string().min(1, "User ID is required"),
			}),
		),
		async (c) => {
			const maybeAdminUser = c.get("user");
			if (!maybeAdminUser || !isSiteAdminUser(maybeAdminUser.siteRole)) {
				return c.json(
					{
						message:
							"You are not authorized to access this endpoint. Only site admins can access other user data.",
						code: API_ERROR_MESSAGES.NOT_AUTHORIZED,
					},
					403,
				);
			}
			const userId = c.req.valid("param").userId;
			const requestedUser = await db.query.user.findFirst({
				where: eq(user.id, userId),
			});
			if (!requestedUser) {
				return c.json(
					{
						message: "User not found",
						code: API_ERROR_MESSAGES.NOT_FOUND,
					},
					404,
				);
			}
			return c.json({ user: requestedUser }, 200);
		},
	);

export default userhandler;
