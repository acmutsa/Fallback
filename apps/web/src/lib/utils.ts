import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const HIDE_SIDEBAR_PATHS = ["/sign-in", "/sign-up", "/forgot-password"];

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

export function getInitials(fullName: string): string {
	// Filter out empty strings from whitespace splitting
	const names = fullName
		.trim()
		.split(/\s+/)
		.filter((name) => name.length > 0);

	if (names.length === 0) return "";
	if (names.length === 1) return names[0][0].toUpperCase();
	return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
}

export function shouldShowNavbar(pathname: string) {
	return !HIDE_SIDEBAR_PATHS.includes(pathname);
}
