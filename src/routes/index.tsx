import { createFileRoute, Link } from "@tanstack/react-router";
import { LucideLogIn } from "lucide-react";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div>
			<div className="text-center py-16 px-4 space-y-6">
				<TypingAnimation className="font-bold text-6xl" as="h1">
					LocalJudge
				</TypingAnimation>
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
