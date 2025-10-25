// src/router.tsx
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

// Create a new query client instance
export const queryClient = new QueryClient();

export function createAppRouter() {
	const router = createRouter({
		routeTree,
		context: { queryClient },
		defaultPreload: "intent",
		scrollRestoration: true,
		defaultStructuralSharing: true,
		defaultPreloadStaleTime: 0,
	});

	// Enable react query SSR
	setupRouterSsrQueryIntegration({
		queryClient,
		router,
		handleRedirects: true,
		wrapQueryClient: true,
	});

	return router;
}
