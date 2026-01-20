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
		<Button onClick={switchTheme} variant="ghost" size="sm">
			{theme === THEME_CONFIG.light ? <Sun /> : <Moon />}
		</Button>
	);
}
