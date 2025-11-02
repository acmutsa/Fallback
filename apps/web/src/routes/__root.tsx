import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { getSession } from "@/lib/functions/auth";
import { redirect } from "@tanstack/react-router";
import { isProtectedRoute } from "@/lib/functions/auth";
import type { RouterContext } from "@/lib/types";
import { Providers } from "@/providers";
// import ErrorComponent from "@/components/shared/error";

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ location }) => {
		console.log("Root beforeLoad fired for ", location.pathname);
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
	component: () => (
		<>
			<Providers>
				<Outlet />
			</Providers>
			<TanStackRouterDevtools />
		</>
	),
	// errorComponent: ({ error }) => <ErrorComponent errorToLog={error} />
});
