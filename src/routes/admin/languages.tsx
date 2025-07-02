import { createFileRoute, useRouter } from "@tanstack/react-router";
import { LucideDownload, LucideLoader2, LucideTrash } from "lucide-react";
import { memo, useState } from "react";
import { localjudge } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/languages")({
	loader: async () => {
		const [runtimes, packages] = await Promise.all([
			rejectError(localjudge.api.piston.runtimes.get()),
			rejectError(localjudge.api.piston.packages.get()),
		]);

		return { runtimes, packages };
	},
	component: RouteComponent,
});

function LanguagesList() {
	const runtimes = Route.useLoaderData({ select: (data) => data.runtimes });

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Language</TableHead>
					<TableHead>Version</TableHead>
					<TableHead>Runtime</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{runtimes.map((runtime) => (
					<TableRow key={runtime.language}>
						<TableCell>{runtime.language}</TableCell>
						<TableCell>{runtime.version}</TableCell>
						<TableCell>{runtime.runtime}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function PackageActionButton(props: {
	language: string;
	language_version: string;
	installed: boolean;
}) {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	return (
		<Button
			size="sm"
			variant={props.installed ? "destructive" : "default"}
			disabled={loading}
			onClick={async () => {
				setLoading(true);
				await localjudge.api.piston.packages[
					props.installed ? "delete" : "post"
				]({
					language: props.language,
					version: props.language_version,
				});
				await router.invalidate({
					filter: (r) => r.fullPath === "/admin/languages",
					sync: true,
				});
				setLoading(false);
			}}
		>
			{loading && <LucideLoader2 className="animate-spin" />}
			{props.installed ? "Remove" : "Install"}
			{props.installed ? <LucideTrash /> : <LucideDownload />}
		</Button>
	);
}

function PackageList() {
	const packages = Route.useLoaderData({ select: (data) => data.packages });

	return (
		<div>
			{/* TODO: memoize components */}
			{packages.map((pkg) => (
				<div
					key={pkg.language + pkg.language_version}
					className="flex items-center justify-between border-b py-2"
				>
					<span className="inline-flex gap-2 items-center">
						{pkg.language}
						<Badge>{pkg.language_version}</Badge>
					</span>
					<PackageActionButton {...pkg} />
				</div>
			))}
		</div>
	);
}

function RouteComponent() {
	return (
		<div className="grid gap-6">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Languages Available
			</h1>
			<LanguagesList />
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Packages
			</h1>
			<PackageList />
		</div>
	);
}
