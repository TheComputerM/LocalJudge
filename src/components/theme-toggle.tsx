import { LucideMoon, LucideSun } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import { setThemeFn } from "@/lib/server/theme";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function ThemeToggle({
	className,
	...props
}: ComponentProps<typeof Button>) {
	const [clientDarkMode, setDarkClientMode] = useState(false);

	useEffect(() => {
		const root = window.document.documentElement;
		const darkMode = root.classList.contains("dark");
		setDarkClientMode(darkMode);
	}, []);

	function toggle() {
		const root = window.document.documentElement;
		const darkMode = root.classList.contains("dark");

		setDarkClientMode(!darkMode);
		root.classList.remove("light", "dark");
		const newTheme = darkMode ? "light" : "dark";
		root.classList.add(newTheme);
		setThemeFn({ data: newTheme });
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			{...props}
			onClick={toggle}
			className={cn("rounded-full", className)}
		>
			{clientDarkMode ? <LucideSun /> : <LucideMoon />}
		</Button>
	);
}
