import { HonoBetterAuth } from "../lib/functions";

const logHandler = HonoBetterAuth().post("/", async (c) => {
	return c.json({ message: "Log endpoint hit" }, 200);
});

export default logHandler;
