import { HonoBetterAuth } from "../lib/functions";
import authHandler from "./auth";
import backupHandler from "./backup";
import logHandler from "./log";
import userhandler from "./user";
import teamHandler from "./team";

const healthHandler = HonoBetterAuth().get("/", (c) => {
	return c.json({ status: "It's alive!" }, 200);
});

export {
	healthHandler,
	authHandler,
	backupHandler,
	logHandler,
	userhandler,
	teamHandler,
};
