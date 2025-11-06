// adapted from: https://leonardomontini.dev/tanstack-start-theme/

import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { ClientOnly, ScriptOnce } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { LucideMoon, LucideSun } from "lucide-react";
import {
	ComponentProps,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const ThemeType = Type.Union([Type.Literal("light"), Type.Literal("dark")]);
type Theme = typeof ThemeType.static;
const THEME_KEY = "ui-theme";

const getStoredTheme = createIsomorphicFn()
	.server(() => "light" as const)
	.client(() => {
		const stored = localStorage.getItem(THEME_KEY);
		if (Value.Check(ThemeType, stored)) {
			return stored;
		}
		return "light";
	});

const themeScript = (function () {
	function setBrowserThemeFn(key: string) {
		const stored = localStorage.getItem(key);
		const theme =
			stored ??
			(window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light");
		document.documentElement.classList.add(theme);
	}
	return `(${setBrowserThemeFn.toString()})("${THEME_KEY}");`;
})();

type ThemeContextVal = [Theme, (theme: Theme) => void];

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function useTheme() {
	const val = useContext(ThemeContext);
	if (!val) throw new Error("useTheme called outside of ThemeProvider");
	return val;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(getStoredTheme());

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
		localStorage.setItem(THEME_KEY, theme);
	}, [theme]);

	return (
		<ThemeContext.Provider value={[theme, setTheme]}>
			<ScriptOnce children={themeScript} />
			{children}
		</ThemeContext.Provider>
	);
}

export function ThemeToggle({
	className,
	...props
}: ComponentProps<typeof Button>) {
	const [theme, setTheme] = useTheme();

	function toggle() {
		setTheme(theme === "dark" ? "light" : "dark");
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			{...props}
			onClick={toggle}
			className={cn("rounded-full", className)}
		>
			<ClientOnly>
				{theme === "dark" ? <LucideSun /> : <LucideMoon />}
			</ClientOnly>
		</Button>
	);
}
