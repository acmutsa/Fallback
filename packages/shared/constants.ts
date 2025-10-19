export const APP_NAME = "Fallback";
export const PERMISSIONS_CONFIG = {
	siteRoles:{

	},
	teamRoles:{
		MEMBER:{
			canRead:true,
		}
	}
};
export const AUTH_CONFIG = {
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 64,
	},
	socialProviders: {
		google: {
			enabled: true,
			icon_path: "some test idk",
		},
		discord: {
			enabled: true,
			icon_path: "some test idk",
		},
		github: {
			enabled: true,
			icon_path: "some test idk",
		},
		linear: {
			enabled: true,
			icon_path: "some test idk",
		},
	},
};

export const GREETINGS_FUNCTIONS = {
	onSignIn: [
		(name: string) => `Welcome back, ${name}!`,
		(name: string) => `Hello again, ${name}!`,
		(name: string) => `Good to see you again, ${name}!`,
		(name: string) => `Hey ${name}, welcome back!`,
		(name: string) => `Hi ${name}, glad you're back!`,
	],
	onSignUp: [
		(name: string) => `Welcome to the platform, ${name}!`,
		(name: string) => `Hi ${name}, we're glad to have you here!`,
		(name: string) => `Hello ${name}, thanks for joining us!`,
		(name: string) => `Welcome aboard ${name}!`,
	],
};

export const PUBLIC_ROUTES = ["/","/sign-in", "/sign-up"];

export const STANDARD_NANOID_SIZE = 12;