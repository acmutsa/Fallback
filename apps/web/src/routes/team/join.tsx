import { createFileRoute } from '@tanstack/react-router'
import { joinTeamSchema } from "shared/zod";

/*
* Team Join Route
* This route will allow users to join a team via an invite code or through the team ID. Team ID is only allowed if the team does not require an invite code.
*/
export const Route = createFileRoute('/team/join')({
  component: RouteComponent,
  validateSearch:(searchParams)=>joinTeamSchema.parse(searchParams)
})

function RouteComponent() {

  const {inv, teamId} = Route.useSearch();
  
  return <div>Hello "/team/join"! Invite code is {inv}</div>
}
