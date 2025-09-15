import { HonoBetterAuth } from "../lib/functions";

const backupHandler = HonoBetterAuth().post("/:backupId", async (c) => {
	return c.json({ message: "Backup endpoint hit" }, 200);
});

export default backupHandler;
