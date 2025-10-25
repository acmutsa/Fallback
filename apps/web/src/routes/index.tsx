import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "shared/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pingServerQueryClient } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData(pingServerQueryClient),
	component: App,
});

function App() {
	const { data, refetch } = useQuery(pingServerQueryClient);
	return (
		<>
			<SignedOut>
				<div>
					<h1>Connection Status: {data || "Not Connected"}</h1>
					<h1 className="text-4xl font-bold">
						Welcome to {APP_NAME}!
					</h1>
					<p className="mt-4">
						This is a simple app using{" "}
						<code>create-tsrouter-app</code>.
					</p>
					<Button
						className="mt-4"
						onClick={async () => {
							toast.loading("Talking to server...");
							const res = await refetch();
							toast.dismiss();
							if (res.isSuccess) {
								toast.success(res.data);
							}
						}}
					>
						Ping server
					</Button>
					<UserButton />
				</div>
			</SignedOut>

			<SignedIn>
				<UserButton />
				<Link to="/team/$teamId" params={{ teamId: "123" }}>
					Go to protected route
				</Link>
			</SignedIn>
		</>
	);
}
