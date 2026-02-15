import { zValidator } from "@hono/zod-validator";
import { HonoBetterAuth } from "../lib/functions";
import { logSchema } from "../lib/zod";
import { logToDb } from "../lib/functions/database";
import type { LoggingType } from "../lib/types";
import { teamIdSchema } from "shared";
import { db, eq, log } from "db";
import { API_ERROR_MESSAGES } from "shared";
import {
	isUserSiteAdminOrQueryHasPermissions,
	getAdminUserForTeam,
	isSiteAdminUser,
} from "../lib/functions/database";

const logHandler = HonoBetterAuth()
	.post("/", zValidator("form", logSchema), async (c) => {
		const logData = c.req.valid("form");

		const { message, logType, ...optionals } = logData;
		// TODO: Come back and make this less ugly please.
		await logToDb(logType as LoggingType, message, {
			...optionals,
		});

		return c.json({ message: "Log endpoint hit" }, 200);
	})
	// This route needs to be made to get logs from a team. Logs should be paginated and alllow for basic filtering on the frontend
	.get("/:teamId", zValidator("param", teamIdSchema), async (c) => {
		const user = c.get("user");
		const teamId = c.req.valid("param").teamId;

		if (!user) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}

		const hasPermissions = await isUserSiteAdminOrQueryHasPermissions(
			user.siteRole,
			getAdminUserForTeam(user.id, teamId),
		);
		if (!hasPermissions) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}
		const logs = await db.query.log.findMany({
			where: eq(log.teamId, teamId),
		});
		return c.json({ message: logs }, 200);
	})
	.get("/admin/all", async (c) => {
		const user = c.get("user");
		if (!user || !isSiteAdminUser(user.siteRole)) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}
		const allLogs = await db.query.log.findMany();
		return c.json({ message: allLogs }, 200);
	});
export default logHandler;
