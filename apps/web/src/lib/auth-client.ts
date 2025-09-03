import { createAuthClient } from "better-auth/react";

// import {env} from "../env"
export const authClient = createAuthClient({
  baseURL: import.meta.env.FALLBACK_PUBLIC_API_URL,
  
});
