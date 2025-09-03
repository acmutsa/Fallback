import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/team/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Create a new team!</div>
}
