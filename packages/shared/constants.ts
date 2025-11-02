export const APP_NAME = "Fallback";
export const APP_VERSION = "0.1.0";
export const PERMISSIONS_CONFIG = {
	siteRoles: {},
	teamRoles: {
		MEMBER: {
			canRead: true,
		},
	},
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
			required: false,
			input: false,
		},
		siteRole: {
			type: "string",
			defaultValue: "USER",
			input: false,
		},
	},
};

export const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/forgot-password"];

export const STANDARD_NANOID_SIZE = 12;
