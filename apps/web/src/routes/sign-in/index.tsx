import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@daveyplate/better-auth-ui'
import { APP_NAME } from 'shared/constants';
import { redirectIfSignedIn } from '@/lib/functions/auth';


export const Route = createFileRoute('/sign-in/')({
  component: RouteComponent,
  beforeLoad(ctx) {
    redirectIfSignedIn(ctx.context);
  }
})

function RouteComponent() {
  return (
		<div className="flex flex-row w-screen h-screen">
			<div className="flex flex-col items-center justify-center w-[60%] bg-violet-500 text-white gap-y-2">
				<h1 className="text-7xl font-black text-center ">Welcome back 👋 </h1>
				<h2 className='font-bold text-xl text-center'>Sign back into {APP_NAME} to pick up where you left off</h2>
			</div>
			<div className="flex flex-1 justify-center items-center">
				<AuthView className="h-fit" view='SIGN_IN' />
			</div>
		</div>
  );
}
