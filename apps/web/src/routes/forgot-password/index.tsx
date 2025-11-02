import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@daveyplate/better-auth-ui'
import { redirectIfSignedIn } from '@/lib/functions/auth';
export const Route = createFileRoute('/forgot-password/')({
  component: RouteComponent,
  beforeLoad(ctx) {
      redirectIfSignedIn(ctx.context);
    },
})

// TODO: Come back and enable this in the config after https://github.com/acmutsa/Fallback/issues/17 is completed
function RouteComponent() {
  return (
		<div className='flex flex-row w-full h-screen items-center justify-center'>
			<AuthView view="FORGOT_PASSWORD" />
		</div>
  );
}
