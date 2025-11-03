import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { LucideChartNoAxesGantt, LucideDoorOpen } from "lucide-react";
import { useState } from "react";
import { localjudge } from "@/api/client";
import { ContestCard } from "@/components/contest-card";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toastManager } from "@/components/ui/toast";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/")({
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
					toastManager.add({
						title: "Failed to register for contest",
						type: "error",
					});
				} else {
					toastManager.add({
						title: "Registered successfully",
						type: "success",
					});
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

function EmptyContestList() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<LucideChartNoAxesGantt />
				</EmptyMedia>
				<EmptyTitle>No Contests Found</EmptyTitle>
				<EmptyDescription>
					You haven't registered for any contests. Ask your administrator for
					the contest code to join one.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function ContestList() {
	const contests = Route.useLoaderData({ select: (data) => data.contests });

	return (
		<div className="grid gap-4">
			{contests.length > 0 ? (
				contests.map((contest) => (
					<ContestCard key={contest.id} {...contest}>
						<Button
							render={<Link to="/contest/$id" params={{ id: contest.id }} />}
							className="w-full"
						>
							Enter
							<LucideDoorOpen />
						</Button>
					</ContestCard>
				))
			) : (
				<EmptyContestList />
			)}
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
