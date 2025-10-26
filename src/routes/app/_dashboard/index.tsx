import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { LucideDoorOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { localjudge } from "@/api/client";
import { ContestCard } from "@/components/contest-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/_dashboard/")({
	loader: async ({ abortController }) => {
		const contests = await rejectError(
			localjudge.contest.get({
				fetch: { signal: abortController.signal },
			}),
		);
		return { contests };
	},
	component: RouteComponent,
});

function RegisterForm() {
	const [code, setCode] = useState("");
	const router = useRouter();

	return (
		<form
			className="flex gap-2"
			onSubmit={async (e) => {
				e.preventDefault();
				e.stopPropagation();
				const { error } = await localjudge.contest.register.post({ code });
				if (error) {
					toast.error("Failed to register for contest");
				} else {
					toast.success("Registered successfully");
				}
				await router.invalidate({
					filter: (d) => d.fullPath === Route.fullPath,
				});
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
			<div className="container mx-auto p-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Contests
				</h1>
				<p className="leading-7 not-first:my-6">
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
