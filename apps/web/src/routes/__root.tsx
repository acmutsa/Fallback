import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { getSession } from "@/lib/functions/auth";
import { redirect } from "@tanstack/react-router";
import { isProtectedRoute } from "@/lib/functions/auth";
import type { RouterContext } from "@/lib/types";
import { Providers } from "@/providers";
import { Navbar } from "@/components/shared/Navbar/navbar";
import ErrorComponent from "@/components/shared/ErrorFallback";

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ location }) => {
		const auth = await getSession();
		if (isProtectedRoute(location.pathname)) {
			if (!auth.data) {
				throw redirect({
					to: "/sign-in",
					// Used to power a redirect after successful login
					search: {
						redirect: location.href,
					},
				});
			}
		}
		return {
			auth,
		};
	},
	component: () => {
		return (
			<Providers>
				<Navbar />
				<Outlet />
				<TanStackRouterDevtools />
			</Providers>
		);
	},
	errorComponent: ({ error }) => <ErrorComponent errorToLog={error} />,
});
