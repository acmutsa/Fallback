import type { ApiType } from "api";
// import {env} from "../../env"
import { hc } from "hono/client";

export const apiClient = hc<ApiType>(
	import.meta.env.VITE_FALLBACK_API_URL || "http://localhost:8787",
	{
		init: {
			credentials: "include",
		},
	},
);
