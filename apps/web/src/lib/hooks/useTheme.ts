import { useEffect, useState } from "react";
import { THEME_CONFIG } from "shared/constants";

export function useTheme() {
	const [theme, setTheme] = useState(THEME_CONFIG.default);

	useEffect(() => {
		const storedTheme = localStorage.getItem(THEME_CONFIG.accessKey);
		if (storedTheme) {
			document.body.classList.remove(
				THEME_CONFIG.light,
				THEME_CONFIG.dark,
			);
			document.body.classList.add(storedTheme);
			setTheme(storedTheme);
		}
	}, []);

	function switchTheme() {
		setTheme((currentTheme) => {
			const newTheme =
				currentTheme === THEME_CONFIG.light
					? THEME_CONFIG.dark
					: THEME_CONFIG.light;
			document.body.classList.remove(THEME_CONFIG.light, THEME_CONFIG.dark);
			document.body.classList.add(newTheme);
			localStorage.setItem(THEME_CONFIG.accessKey, newTheme);
			return newTheme;
		});
	}

	return { theme, switchTheme };
}
