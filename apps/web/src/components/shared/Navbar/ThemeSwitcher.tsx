import { Moon, Sun } from "lucide-react";
import { THEME_CONFIG } from "shared/constants";
import { Button } from "@/components/ui/button";
export default function ThemeSwitcher({
	theme,
	switchTheme,
}: {
	theme: string;
	switchTheme: () => void;
}) {
	return (
		<Button
			onClick={switchTheme}
			variant="ghost"
			size="sm"
			aria-label={
				theme === THEME_CONFIG.light
					? "Switch to dark theme"
					: "Switch to light theme"
			}
			aria-pressed={theme === THEME_CONFIG.dark}
		>
			{theme === THEME_CONFIG.light ? <Sun /> : <Moon />}
		</Button>
	);
}
