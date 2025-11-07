import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/outfit";
import "@/styles/app.css";
import {
	LucideMonitor,
	LucideMoon,
	LucideServer,
	LucideSun,
} from "lucide-react";
import { Fragment } from "react";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Toggle, ToggleGroup } from "@/components/ui/toggle-group";
import { HomePage } from "./homepage";
import { Navbar } from "./navbar";

// sync with the one in src/routes/index.tsx
function Hero() {
	return (
		<div className="min-h-svh flex items-center justify-center px-6">
			<div className="text-center max-w-3xl">
				<h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[1.2] font-semibold tracking-tighter">
					LocalJudge
				</h1>
				<p className="mt-6 md:text-lg text-foreground/80">
					Your Self-Hosted, Open-Source Online Coding Judge System. Perfect for
					hosting coding assignments and contests for schools, universities, and
					coding clubs.
				</p>
				<div className="mt-12 flex items-center justify-center gap-4">
					<Button size="lg" className="text-base" render={<a />}>
						<LucideServer className="size-5" />
						Self-Host
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="text-base shadow-none"
						render={
							<a
								href="https://github.com/TheComputerM/LocalJudge"
								target="_blank"
							/>
						}
					>
						<SiGithub className="size-5" /> GitHub
					</Button>
				</div>
			</div>
		</div>
	);
}

function ThemeSwitcher() {
	type ThemeMode = "system" | "light" | "dark";
	const [mode, setMode] = useState<ThemeMode>("system");
	const systemMode = useMemo(() => {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		if (mode === "system") {
			root.classList.add(systemMode);
		} else {
			root.classList.add(mode);
		}
	}, [mode]);

	return (
		<ToggleGroup
			variant="outline"
			value={[mode]}
			onValueChange={([value]) => value && setMode(value as ThemeMode)}
		>
			<Toggle value="system">
				<LucideMonitor />
			</Toggle>
			<Toggle value="light">
				<LucideSun />
			</Toggle>
			<Toggle value="dark">
				<LucideMoon />
			</Toggle>
		</ToggleGroup>
	);
}

function App() {
	return (
		<Fragment>
			<Navbar>
				<ThemeSwitcher />
			</Navbar>
			<Hero />
			<HomePage />
		</Fragment>
	);
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
