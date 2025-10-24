import { createFileRoute } from '@tanstack/react-router'
import { AccountSettingsCards } from '@daveyplate/better-auth-ui'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
})

// TODO: Rip this out and replace with our own. This is just for demo purposes
function RouteComponent() {
  return <AccountSettingsCards />;
}
