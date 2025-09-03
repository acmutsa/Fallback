import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GREETINGS_FUNCTIONS } from "shared/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomArrayItem<T>(array: T[]): T | undefined {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function getFirstName(fullName: string): string {
  const names = fullName.split(" ");
  return names.length > 0 ? names[0] : fullName;
}

export function getRandomSignInGreeting(name: string): string {
  const randomGreetingFunction = getRandomArrayItem<typeof GREETINGS_FUNCTIONS.onSignIn[number]>(GREETINGS_FUNCTIONS.onSignIn)!;
  return randomGreetingFunction(name);
}

export function getRandomSignUpGreeting(name: string): string {
  /// @ts-expect-error
  const randomGreetingFunction = getRandomArrayItem<typeof GREETINGS_FUNCTIONS.onSignUp[number]>(GREETINGS_FUNCTIONSonSignUp)!;
  return randomGreetingFunction(name);
}