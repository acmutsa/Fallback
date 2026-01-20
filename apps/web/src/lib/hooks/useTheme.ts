import { useEffect, useState } from "react";
import { THEME_CONFIG } from "shared/constants";

export function useTheme() {
	const [theme, setTheme] = useState(THEME_CONFIG.default);

	useEffect(() => {
		const storedTheme = localStorage.getItem(THEME_CONFIG.accessKey);
		if (storedTheme) {
			document.body.classList = storedTheme;
			setTheme(storedTheme);
		}
	}, []);

	function switchTheme() {
		const newTheme =
			theme === THEME_CONFIG.light
				? THEME_CONFIG.dark
				: THEME_CONFIG.light;
		document.body.classList = newTheme;
		setTheme(newTheme);
		localStorage.setItem(THEME_CONFIG.accessKey, newTheme);
	}

	return { theme, switchTheme };
}
