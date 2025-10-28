import {
	ClientOnly,
	createFileRoute,
	Link,
	Outlet,
} from "@tanstack/react-router";
import { lightFormat } from "date-fns";
import { LucideGavel } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ThemeToggle } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import { useTime } from "@/hooks/use-time";

export const Route = createFileRoute("/_authenticated/app")({
	component: RouteComponent,
});

function NavClock() {
	const currentTime = useTime();
	return <span>{lightFormat(currentTime, "HH:mm:ss")}</span>;
}

function Navbar() {
	return (
		<header className="border-b px-4 md:px-6">
			<div className="flex h-16 items-center justify-between gap-4">
				<div className="flex-1 inline-flex items-center gap-2 text-primary">
					<LucideGavel />
					<Link to="/app" className="font-semibold text-lg max-sm:hidden">
						LocalJudge
					</Link>
				</div>
				<div className="grow text-center">
					<ClientOnly>
						<NavClock />
					</ClientOnly>
				</div>
				<div className="flex flex-1 items-center justify-end gap-2">
					<ThemeToggle />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<UserProfile />
				</div>
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer className="text-center text-sm text-muted-foreground">
			<div className="container mx-auto p-4">LocalJudge</div>
		</footer>
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<Outlet />
			<Footer />
		</>
	);
}
