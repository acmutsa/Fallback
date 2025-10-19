import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@daveyplate/better-auth-ui'
import { redirect } from "@tanstack/react-router";
import { APP_NAME } from "shared/constants";

export const Route = createFileRoute("/sign-up/")({
	component: RouteComponent,
});

function RouteComponent() {
  const {auth} = Route.useRouteContext()
    if (auth?.data){
      return redirect({
        to:"/profile",
      })
    }
    return (
      <div className="flex flex-row w-screen h-screen">
        <div className="flex flex-col items-center justify-center w-[60%] bg-violet-500 text-white gap-y-2">
          <h1 className="text-7xl font-black text-center ">Welcome to {APP_NAME} 👋 </h1>
          <h2 className='font-bold text-xl text-center'>Take a quick second to sign up and you'll be on your way to the most seamless backup experience</h2>
        </div>
        <div className="flex flex-1 justify-center items-center">
          <AuthView className="h-fit" view='SIGN_UP' socialLayout='grid'  />
        </div>
      </div>
    );
}
