import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/feedback/')({
  component: RouteComponent,
})

/*
Feedback route
This route will display a feedback form for users to submit feedback
*/
function RouteComponent() {
  return <div>Hello "/feedback/"!</div>
}
