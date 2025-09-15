import { auth } from "../lib/auth";
import { HonoBetterAuth } from "../lib/functions";

const authHandler = HonoBetterAuth().on(["POST", "GET"], "/", (c) => {
	return auth.handler(c.req.raw);
});

export default authHandler;
