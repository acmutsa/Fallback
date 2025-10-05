import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { getSession } from "@/lib/functions/auth";
import { redirect } from "@tanstack/react-router";
import { isProtectedRoute } from "@/lib/functions/auth";

type RouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	
	beforeLoad: async({location}) =>{
		if (isProtectedRoute(location.pathname)) {
			const auth = await getSession();
			
			if (!auth.data){
				throw redirect({
					to:"/sign-in",
					// Used to power a redirect after successful login
					search:{
						redirect:location.href
					}
				})
			}
		}
	},

	component: () => (
		<>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
})
