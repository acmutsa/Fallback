import { createFileRoute } from '@tanstack/react-router'
import { joinTeamSchema } from "shared/zod";


export const Route = createFileRoute('/team/$teamId/join')({
  component: RouteComponent,
  validateSearch:(searchParams)=>joinTeamSchema.parse(searchParams)
})

function RouteComponent() {
  const {inv} = Route.useSearch();
  if (!inv){
    // We would want to render a card that accepts a code if it is blank

  }
  return <div>Hello "/team/$teamId/join"! Invite code is {inv}</div>
}
