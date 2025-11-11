import { createFileRoute, Link, linkOptions } from "@tanstack/react-router";
import {
	LucideBookPlus,
	LucideChevronRight,
	LucideFileCode,
	LucideUsers,
} from "lucide-react";
import { Fragment, useMemo } from "react";
import { localjudge } from "@/api/client";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/")({
	loader: async ({ abortController }) => {
		const overview = await rejectError(
			localjudge.admin.overview.get({
				fetch: {
					signal: abortController.signal,
				},
			}),
		);
		return { overview };
	},
	component: RouteComponent,
});

function Overview() {
	const overview = Route.useLoaderData({ select: ({ overview }) => overview });

	return (
		<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
			{Object.entries(overview.statistics).map(([name, value]) => (
				<Card key={name}>
					<CardHeader>
						<CardDescription className="capitalize">{name}</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{value}
						</CardTitle>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}

function QuickLinks() {
	const items = useMemo(
		() => [
			{
				icon: LucideBookPlus,
				title: "Create Contest",
				description: "Create a new programming contest.",
				link: linkOptions({
					to: "/admin/contest/new",
				}),
			},
			{
				icon: LucideUsers,
				title: "Manage Users",
				description: "View and manage all users in the system.",
				link: linkOptions({
					to: "/admin/user",
				}),
			},
			{
				icon: LucideFileCode,
				title: "View Submissions",
				description: "Browse and review code submissions from users.",
				link: linkOptions({
					to: "/admin/submissions",
				}),
			},
		],
		[],
	);
	return (
		<div className="grid md:grid-cols-2 gap-4">
			{items.map((item) => (
				<Item
					key={item.title}
					variant="outline"
					render={<Link {...item.link} />}
				>
					<ItemMedia variant="icon">
						<item.icon />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{item.title}</ItemTitle>
						<ItemDescription>{item.description}</ItemDescription>
					</ItemContent>
					<ItemActions>
						<LucideChevronRight className="size-5" />
					</ItemActions>
				</Item>
			))}
		</div>
	);
}

function RouteComponent() {
	return (
		<Fragment>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Admin Dashboard
			</h1>
			<br />
			<Overview />
			<br />
			<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
				Quick Links
			</h2>
			<br />
			<QuickLinks />
		</Fragment>
	);
}
