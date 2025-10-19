import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./router";

export function Providers({ children }: { children: React.ReactNode }) {

	return (
		<QueryClientProvider client={queryClient}>
			<AuthQueryProvider>
				<AuthUIProviderTanstack
					authClient={authClient}
					navigate={(href) => useRouter().navigate({ href })}
					replace={(href) => useRouter().navigate({ href, replace: true })}
					Link={({ href, ...props }) => <Link to={href} {...props} />}
					persistClient={false}
					basePath="/"
					baseURL={
						import.meta.env.VITE_FALLBACK_WEB_URL ||
						"http://localhost:3000"
					}
					social={{
						providers: ["github", "google", "discord", "linear"],
					}}
          localization={{
            SIGN_IN:"Sign In",
            SIGN_IN_DESCRIPTION:"Welcome back! Please enter your details.",
            SIGN_UP:"Create Account",
            SIGN_UP_DESCRIPTION:"Let's get you started with a free account.",
          }}
          
          
					// avatar={{
					// 	upload: async (file) => {
					// 		const formData = new FormData();
					// 		formData.append("avatar", file);
					// 		const res = await fetch("/api/uploadAvatar", {
					// 			method: "POST",
					// 			body: formData,
					// 		});
					// 		const { data } = await res.json();
					// 		return data.url;
					// 	},
					// 	delete: async (url) => {
					// 		await fetch("/api/deleteAvatar", {
					// 			method: "POST",
					// 			headers: { "Content-Type": "application/json" },
					// 			body: JSON.stringify({ url }),
					// 		});
					// 	},
					// 	// Custom Image component for rendering avatar images
					// 	// Useful for CDN optimization (Cloudinary, Imgix, ImgProxy, etc.)
					// 	Image: Image, // Use Next.js Image component for avatars
					// }}
				>
					{children}
				</AuthUIProviderTanstack>
			</AuthQueryProvider>
		</QueryClientProvider>
	);
}
