import { Link } from "@tanstack/react-router";

import { useIsMobile } from "@/hooks/use-mobile";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { shouldShowNavbar } from "@/lib/utils";
import { useLocation } from "@tanstack/react-router";
import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import { Button } from "@/components/ui/button";

import UserButton from "./UserButton";

export function Navbar() {
	const isMobile = useIsMobile();
	const { pathname } = useLocation();

	const showNavbar = shouldShowNavbar(pathname);
	if (!showNavbar) {
		return null;
	}

	return (
		<NavigationMenu
			viewport={isMobile}
			className="max-w-screen items-start block px-4 py-1 border-b"
		>
			<SignedOut>
				<SignedOutNavList />
			</SignedOut>
			<SignedIn>
				<SignedInNavList />
			</SignedIn>
		</NavigationMenu>
	);
}

function SignedOutNavList() {
	return (
		<NavigationMenuList className="flex w-full flex-wrap items-center justify-between">
			<NavigationMenuItem className="font-bold text-md">
				Fallback Placeholder
			</NavigationMenuItem>
			<div className="flex flex-row items-center justify-center gap-4">
				<NavigationMenuItem>
					{/* <Link to="/sign-in"> */}
					<a href="/sign-in">
						<Button variant="ghost" size="sm">
							Login
						</Button>
					</a>
					{/* </Link> */}
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link to="/sign-up">
						<Button variant="outline" size="sm">
							Get Started
						</Button>
					</Link>
				</NavigationMenuItem>
			</div>
		</NavigationMenuList>
	);
}

function SignedInNavList() {
	return (
		<NavigationMenuList className="flex w-full flex-wrap items-center justify-between">
			<NavigationMenuItem className="font-black text-lg">
				Fallback Placeholder
			</NavigationMenuItem>

			<NavigationMenuItem>
				<UserButton />
			</NavigationMenuItem>
		</NavigationMenuList>
	);
}
