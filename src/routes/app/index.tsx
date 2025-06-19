import { createFileRoute } from "@tanstack/react-router";
import { LucideGavel } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/")({
	component: RouteComponent,
});

function Navbar() {
	return (
		<header className="border-b px-4 md:px-6">
			<div className="flex h-16 items-center justify-between gap-4">
				<div className="flex-1 inline-flex items-center gap-2 text-primary">
					<LucideGavel />
					<span className="font-semibold text-lg max-sm:hidden">
						LocalJudge
					</span>
				</div>
				<div className="grow text-center">00:00:00</div>
				<div className="flex flex-1 items-center justify-end gap-2">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}

function RegisterForm() {
	return (
		<div className="flex gap-2">
			<Input placeholder="Contest Code" />
			<Button>Register</Button>
		</div>
	);
}

function ContestCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Contest Name</CardTitle>
				<CardDescription>2 questions</CardDescription>
				<CardAction>
					<Button>Enter</Button>
				</CardAction>
			</CardHeader>
			<CardFooter className="flex justify-between">
				<span>00:00:00</span>
				<span>Starting in 2mins</span>
			</CardFooter>
		</Card>
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<div className="container mx-auto p-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Contests
				</h1>
				<p className="leading-7 [&:not(:first-child)]:my-6">
					List of contests you are registered for, ask your admistrator for the
					contest code if it doesn't appear here.
				</p>
				<RegisterForm />
			</div>
			<Separator className="my-8" />
			<div className="container mx-auto p-4">
				<div className="grid gap-4">
					<ContestCard />
				</div>
			</div>
		</>
	);
}
