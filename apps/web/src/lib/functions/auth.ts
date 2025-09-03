import { authClient } from "../auth-client";
import type { EmailSignUpType, EmailSignInType } from "../types";
import { toast } from "sonner";
import { getRandomSignInGreeting, getFirstName, getRandomSignUpGreeting } from "../utils";

const callbackURL = "/dashboard"; // A URL to redirect to after the user verifies their email (optional)

export async function signUpEmail(inputs:EmailSignUpType){
  const {redirectUrl, ...restInputs} = inputs; 
  await authClient.signUp.email(
    {
      ...restInputs,
      callbackURL: redirectUrl || callbackURL,
    },
    {
      onSuccess: (ctx) => {
        // This could be wrong 
        const firstName = getFirstName(ctx.data.user.name);
        toast.success(getRandomSignUpGreeting(firstName));
      },
      onError: () => {
        toast.error("Something went wrong signing you up. Please try again later.");
      },
    }
  );
}

export async function signInEmail(inputs: EmailSignInType) {
  const { redirectUrl, ...restInputs } = inputs; 
  const { data, error } = await authClient.signIn.email(
    {
      ...restInputs,
      callbackURL: redirectUrl || callbackURL,
    },
    {
      onSuccess: (ctx) => {
        const firstName = getFirstName(ctx.data.user.name);
        toast.success(getRandomSignInGreeting(firstName));
      },
      onError: () => {
        toast.error("Something went wrong signing you in. Please try again later.");
      },
    }
  );

  return {name:data?.user.name, error:error?.message}
}

export async function signInOauth(provider:string, redirectUrl?:string) {
  await authClient.signIn.social({
    provider,
    /**
     * A URL to redirect after the user authenticates with the provider
     * @default "/"
     */
    callbackURL : redirectUrl || callbackURL,
    /**
     * A URL to redirect if an error occurs during the sign in process
     */
    errorCallbackURL: "/error", // come back and confiure this later maybe for logging purposes

  },
{
  onSuccess: (ctx) => {
    const firstName = getFirstName(ctx.data.user.name);
    toast.success(getRandomSignInGreeting(firstName));
  },
  onError: () => {
    // display the error message
    toast.error("Something went wrong signing you in. Please try again later.");
  },
});
}

export async function signOut() {
  const {data, error} = await authClient.signOut();
  return {data ,error}
}
