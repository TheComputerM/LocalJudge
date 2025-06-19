import { LucideMoon, LucideSun } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import { setThemeFn } from "@/lib/server/theme";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/__root";
import { Button } from "./ui/button";

export function ThemeToggle({
	className,
	...props
}: ComponentProps<typeof Button>) {
	const defaultTheme = Route.useLoaderData({ select: (data) => data.theme });
	const [darkMode, setDarkMode] = useState(defaultTheme === "dark");

	function toggle() {
		setDarkMode((mode) => !mode);
	}

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		const theme = darkMode ? "dark" : "light";

		root.classList.add(theme);
		setThemeFn({ data: theme });
	}, [darkMode]);

	return (
		<Button
			onClick={toggle}
			variant="ghost"
			size="icon"
			{...props}
			className={cn("rounded-full", className)}
		>
			{darkMode ? <LucideSun /> : <LucideMoon />}
		</Button>
	);
}
