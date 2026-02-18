import { createFileRoute } from "@tanstack/react-router";
import { joinTeamSchema as joinTeamSchemaZod } from "shared/zod";

/*
 * Team Join Route
 * This route will allow users to join a team via an invite code or through the team ID. Team ID is only allowed if the team does not require an invite code.
 */

const joinTeamSchemaInviteOption = joinTeamSchemaZod
	.pick({ inviteId: true })
	.partial();
export const Route = createFileRoute("/team/join")({
	component: RouteComponent,
	validateSearch: (searchParams) =>
		joinTeamSchemaInviteOption.parse(searchParams),
});

function RouteComponent() {
	const { inviteId } = Route.useSearch();

	return <div>Hello "/team/join"! Invite code is {inviteId}</div>;
}
