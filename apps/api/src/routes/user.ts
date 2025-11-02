import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HonoBetterAuth } from "../lib/functions";
import { db, eq } from "db";
import { user } from "db/schema";

const userhandler = HonoBetterAuth()
	.get("/", async (c) => {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "User has been deleted." }, 400);
		}
		return c.json({ user }, 200);
	})
	// This needs a permission check. Only admins of the site should be able to see ths endpoint
	.get(
		"/:userId",
		zValidator(
			"param",
			z.object({
				userId: z.string().min(1, "User ID is required"),
			}),
		),
		async (c) => {
			const userId = c.req.param("userId");
			const requestedUser = await db.query.user.findFirst({
				where: eq(user.id, userId),
			});
			if (!requestedUser) {
				return c.json({ error: "User not found" }, 404);
			}
			return c.json({ user: requestedUser }, 200);
		},
	);

export default userhandler;
