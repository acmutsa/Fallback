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

export const THEME_CONFIG = {
	accessKey: "fallback-theme",
	dark: "dark",
	light: "light",
	default: "light",
};

export const API_ERROR_MESSAGES = {
	NO_INVITE_CODE: "NO_INVITE_CODE",
	CODE_NOT_FOUND: "CODE_NOT_FOUND",
	CODE_EXPIRED: "CODE_EXPIRED",
	NOT_FOUND: "NOT_FOUND",
	NOT_AUTHORIZED: "NOT_AUTHORIZED",
	ALREADY_MEMBER: "ALREADY_MEMBER",
	GENERIC_ERROR: "GENERIC_ERROR",
	NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
};
