import { HonoBetterAuth } from "../lib/functions";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

const backupHandler = HonoBetterAuth().post(
	"/:backupId",
	zValidator(
		"param",
		z.object({
			backupId: z.string().min(1, "Backup ID is required"),
		}),
	),
	async (c) => {
		const backupId = c.req.valid("param").backupId;
		return c.json(
			{
				message: `Backup endpoint hit for backup ID: ${backupId}`,
			},
			200,
		);
	},
);

export default backupHandler;
