import { zValidator } from "@hono/zod-validator";
import { HonoBetterAuth } from "../lib/functions";
import { logSchema } from "../lib/zod";
import { logToDb } from "../lib/functions/database";
import { LoggingType } from "../lib/types";
import { teamIdValidator } from "shared";
import { db } from "db";
import { API_ERROR_MESSAGES } from "shared";
import { isSiteAdminUser } from "../lib/functions/database";

const logHandler = HonoBetterAuth()
	.post("/", zValidator("form", logSchema), async (c) => {
		const logData = c.req.valid("form");

		const {message,logType, ...optionals} = logData;
		// TODO: Come back and make this less ugly please.
		await logToDb(logType as unknown as LoggingType, message, {
		...optionals,
		})

		return c.json({ message: "Log endpoint hit" }, 200);
})
// This route needs to be made to get logs from a team. Logs should be paginated and alllow for basic filtering on the frontend
	.get("/:teamId",zValidator("param", teamIdValidator), async (c) => {
		// Ensure only site admins or team admins can access these logs 
	})
	.get("/admin/all", async (c) => {
		const user = c.get("user");
		if (!user || !isSiteAdminUser(user.siteRole)) {
			return c.json({ message: API_ERROR_MESSAGES.notAuthorized }, 401);
		}
		const allLogs = await db.query.log.findMany();
		return c.json({ message: allLogs }, 200);
})
;
export default logHandler;
