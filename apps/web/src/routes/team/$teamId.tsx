import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/team/$teamId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { teamId } = Route.useParams();

	return <div>Slug is {teamId}</div>;
}
