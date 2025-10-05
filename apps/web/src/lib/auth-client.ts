import { createAuthClient } from "better-auth/react";

console.log(
	"api url for better auth client",
	import.meta.env.VITE_FALLBACK_API_URL,
);
export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_FALLBACK_API_URL,
});
