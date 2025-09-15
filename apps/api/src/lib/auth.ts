import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "db"; // your drizzle instance
import { APP_NAME, AUTH_CONFIG } from "shared/constants";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		debugLogs: true,
	}),
	databaseHooks: {
		user: {
			create: {
				// used in order to break up the first and last name into separate fields
				before: async (user) => {
					// split the name into first and last name (name object is mapped to the first name by the config)
					const [firstName, ...rest] = user.name.split(" ");
					const lastName = rest.join(" ");
					return {
						data: { ...user, firstName, lastName },
					};
				},
			},
		},
	},
	user: {
		// this maps the default "name" field to the "firstName" field in the database
		fields: {
			name: "firstName",
		},
		// this declares the extra fields that are not in the default user schema that better auth creates, but are in the database
		additionalFields: {
			firstName: {
				type: "string",
				defaultValue: "",
			},
			lastName: {
				type: "string",
				defaultValue: "",
			},
			lastSeen: {
				type: "date",
				required: true,
				defaultValue: Date.now(),
				input: false,
			},
			// role: {
			// 	type: "string",
			// 	defaultValue: "user",
			// 	validator: {
			// 		input: z.enum(["user", "admin"]),
			// 		output: z.enum(["user", "admin"]),
			// 	},
			// },
		},
	},
	advanced: {
		cookiePrefix: APP_NAME,
	},
	emailAndPassword: {
		enabled: AUTH_CONFIG.emailAndPassword.enabled,
		minPasswordLength: AUTH_CONFIG.emailAndPassword.minPasswordLength,
		maxPasswordLength: AUTH_CONFIG.emailAndPassword.maxPasswordLength,
	},
	// TODO: Reference the following link to see if it is easier to have the social provider's returned values map to first and last name instead
	//  https://www.better-auth.com/docs/concepts/database#extending-core-schema:~:text=Example%3A%20Mapping%20Profile%20to%20User%20For%20firstName%20and%20lastName
	// socialProviders: {
	//   google: {
	//     clientId: env.GOOGLE_CLIENT_ID,
	//     clientSecret: env.GOOGLE_CLIENT_SECRET,
	//   },
	//   discord: {
	//     clientId: env.DISCORD_CLIENT_ID,
	//     clientSecret: env.DISCORD_CLIENT_SECRET,
	//   },
	//   github: {
	//     clientId: env.GITHUB_CLIENT_ID,
	//     clientSecret: env.GITHUB_CLIENT_SECRET,
	//   },
	//   linear: {
	//     clientId: env.LINEAR_CLIENT_ID,
	//     clientSecret: env.LINEAR_CLIENT_SECRET,
	//   },
	// },
	rateLimit: {
		window: 10, // time window in seconds
		max: 100, // max requests in the window
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
});
