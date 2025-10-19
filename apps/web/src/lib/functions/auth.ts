import { authClient } from "../auth-client";
import { PUBLIC_ROUTES } from "shared/constants";
import type { RouterContext } from "../types";
import { redirect } from "@tanstack/react-router";

export function isPublicRoute(pathname:string){
	return PUBLIC_ROUTES.includes(pathname);
}

export function isProtectedRoute(pathname:string){
	return !isPublicRoute(pathname);
}

export async function getSession(){
	return authClient.getSession();
}

export async function signOut() {
	const { data, error } = await authClient.signOut();
	return { data, error };
}

export function redirectIfSignedIn(ctx: RouterContext, to:string = '/') {
	if (ctx.auth?.data){
      throw redirect({
        to
      })
    }
}