import { useRouter } from "@tanstack/react-router";
import { LucideMoon, LucideSun } from "lucide-react";
import {
	type ComponentProps,
	createContext,
	type PropsWithChildren,
	use,
} from "react";
import { setThemeFn, Theme } from "@/lib/server/theme";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type ThemeContextVal = [Theme, (val: Theme) => void];
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider({ children, theme }: Props) {
	const router = useRouter();

	function setTheme(val: Theme) {
		setThemeFn({ data: val }).then(() => router.invalidate());
	}

	return <ThemeContext value={[theme, setTheme]}>{children}</ThemeContext>;
}

export function useTheme() {
	const val = use(ThemeContext);
	if (!val) throw new Error("useTheme called outside of ThemeProvider!");
	return val;
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
			{theme === "dark" ? <LucideSun /> : <LucideMoon />}
		</Button>
	);
}
