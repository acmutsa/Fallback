import { createAuthClient } from "better-auth/react";
import { AUTH_CONFIG } from "shared/constants";
import type { FieldAttribute, FieldType } from "better-auth/db";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_FALLBACK_API_URL,
	$InferAuth: {
		user: {
			additionalFields: {
				...(AUTH_CONFIG.additionalFields as
					| {
							[key: string]: FieldAttribute<FieldType>;
					  }
					| undefined),
			},
		},
	},
});
