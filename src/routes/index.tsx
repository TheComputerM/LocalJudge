import { createFileRoute, Link } from "@tanstack/react-router";
import { LucideLogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div>
			<div className="text-center py-16 px-4 space-y-6">
				<h1 className="font-bold text-6xl">LocalJudge</h1>
				<p className="text-xl text-balance">
					Open-source coding judge. Easy to host. Easy to run. Fully under your
					control.
				</p>
				<br />
				<Button size="lg" asChild>
					<Link to="/login">
						Login
						<LucideLogIn />
					</Link>
				</Button>
			</div>
		</div>
	);
}
