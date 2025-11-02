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
		return c.json(
			{
				message: `Backup endpoint hit for backup ID: ${c.req.param("backupId")}`,
			},
			200,
		);
	},
);

export default backupHandler;
