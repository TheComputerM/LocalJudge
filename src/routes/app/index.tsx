import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { lightFormat } from "date-fns";
import { LucideDoorOpen, LucideGavel } from "lucide-react";
import { useState } from "react";
import { localjudge } from "@/api/client";
import { ContestCard } from "@/components/contest-card";
import { SignOutButton } from "@/components/sign-out";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTime } from "@/hooks/use-time";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
	loader: async ({ abortController }) => {
		const contests = await rejectError(
			localjudge.api.contest.get({
				fetch: { signal: abortController.signal },
			}),
		);
		return { contests };
	},
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
					<span className="font-semibold text-lg max-sm:hidden">
						LocalJudge
					</span>
				</div>
				<div className="grow text-center">
					<NavClock />
				</div>
				<div className="flex flex-1 items-center justify-end gap-2">
					<ThemeToggle />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<SignOutButton />
				</div>
			</div>
		</header>
	);
}

function RegisterForm() {
	const [code, setCode] = useState("");
	const router = useRouter();

	return (
		<form
			className="flex gap-2"
			onSubmit={async (e) => {
				e.preventDefault();
				e.stopPropagation();
				await localjudge.api.contest.post({ code });
				router.invalidate({ filter: (d) => d.fullPath === Route.fullPath });
			}}
		>
			<Input
				placeholder="Contest Code"
				value={code}
				onChange={(e) => setCode(e.target.value)}
			/>
			<Button type="submit">Register</Button>
		</form>
	);
}

function ContestList() {
	const contests = Route.useLoaderData({ select: (data) => data.contests });

	return (
		<div className="grid gap-4">
			{contests.map((contest) => (
				<ContestCard key={contest.id} {...contest}>
					<Button asChild className="w-full">
						<Link to="/app/contest/$id" params={{ id: contest.id }}>
							Enter
							<LucideDoorOpen />
						</Link>
					</Button>
				</ContestCard>
			))}
		</div>
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
				<ContestList />
			</div>
		</>
	);
}
