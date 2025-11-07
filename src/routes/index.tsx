import { createFileRoute, Link } from "@tanstack/react-router";
import { LucideLogIn } from "lucide-react";
import { Fragment } from "react";
import { SiGithub } from "react-icons/si";
import { ThemeToggle } from "@/components/providers/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HomePage } from "@/gh-pages/homepage";
import { Navbar } from "@/gh-pages/navbar";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function Hero() {
	return (
		<div className="min-h-svh flex items-center justify-center px-6">
			<div className="text-center max-w-3xl">
				<Badge
					variant="secondary"
					className="rounded-full py-1 px-2 border-border"
				>
					TODO: Status Monitor
				</Badge>
				<h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[1.2] font-semibold tracking-tighter">
					LocalJudge
				</h1>
				<p className="mt-6 md:text-lg text-foreground/80">
					Your Self-Hosted, Open-Source Online Coding Judge System. Perfect for
					hosting coding assignments and contests for schools, universities, and
					coding clubs.
				</p>
				<div className="mt-12 flex items-center justify-center gap-4">
					<Button size="lg" className="text-base" render={<Link to="/login" />}>
						Login <LucideLogIn className="size-5" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="text-base shadow-none"
						render={
							<a
								href="https://github.com/TheComputerM/localjudge"
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

function RouteComponent() {
	return (
		<Fragment>
			<Navbar>
				<ThemeToggle />
			</Navbar>
			<Hero />
			<HomePage />
		</Fragment>
	);
}
