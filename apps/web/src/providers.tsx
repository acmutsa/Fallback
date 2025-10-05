import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./router";

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return (
		<QueryClientProvider client={queryClient}>
			<AuthQueryProvider>
				<AuthUIProviderTanstack
					authClient={authClient}
					navigate={(href) => router.navigate({ href })}
					replace={(href) => router.navigate({ href, replace: true })}
					Link={({ href, ...props }) => <Link to={href} {...props} />}
					persistClient={false}
          basePath="/"
				>
					{children}
				</AuthUIProviderTanstack>
			</AuthQueryProvider>
		</QueryClientProvider>
	);
}
