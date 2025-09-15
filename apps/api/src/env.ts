import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
export const env = createEnv({
	server: {
		CLOUDFLARE_ACCOUNT_ID: z.string({
			description:
				"Account ID for the Cloudflare account. Note that this ID should be the same one the bucket is hosted in.",
		}),
		FALLBACK_WEB_URL: z
			.string({
				description:
					"The URL of the frontend. DO NOT ADD A TRAILING SLASH",
			})
			.url(),
		R2_ACCESS_KEY_ID: z.string(),
		R2_SECRET_ACCESS_KEY: z.string(),
		BETTER_AUTH_SECRET: z.string(),
		// TODO: add these back once the oauth stuff is implemented.
		// GOOGLE_CLIENT_ID: z.string(),
		// GOOGLE_CLIENT_SECRET: z.string(),
		// DISCORD_CLIENT_ID: z.string(),
		// DISCORD_CLIENT_SECRET: z.string(),
		// GITHUB_CLIENT_ID: z.string(),
		// GITHUB_CLIENT_SECRET: z.string(),
		// LINEAR_CLIENT_ID: z.string(),
		// LINEAR_CLIENT_SECRET: z.string(),
	},
	onValidationError: (issues) => {
		console.log("all process variables:", process.env);
		console.error("❌ Invalid environment variables:", issues);
		throw new Error("Invalid environment variables");
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
