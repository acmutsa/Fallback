import { createFileRoute } from "@tanstack/react-router";

/*
 * Team index route
 * This route will display the teams you are a part of and manage
 * NOTE: Not too sure this is needed
 */
export const Route = createFileRoute("/team/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>BTestd</div>;
}
