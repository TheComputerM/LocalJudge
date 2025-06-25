import { createFileRoute, useRouter } from "@tanstack/react-router";
import { LucideLoader2 } from "lucide-react";
import { useState } from "react";
import { localjudge } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn, rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/languages")({
	loader: async () => {
		const [runtimes, _packages] = await Promise.all([
			rejectError(localjudge.api.admin.piston.runtimes.get()),
			rejectError(localjudge.api.admin.piston.packages.get()),
		]);

		const packages: Record<string, { version: string; installed: boolean }[]> =
			_packages.reduce(
				(acc, pkg) => {
					const element = {
						version: pkg.language_version,
						installed: pkg.installed,
					};
					if (acc[pkg.language]) {
						acc[pkg.language].push(element);
					} else {
						acc[pkg.language] = [element];
					}
					return acc;
				},
				{} as Record<string, { version: string; installed: boolean }[]>,
			);

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
				</TableRow>
			</TableHeader>
			<TableBody>
				{runtimes.map((runtime) => (
					<TableRow key={runtime.language}>
						<TableCell>{runtime.language}</TableCell>
						<TableCell>{runtime.version}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function PackageActionButton(props: {
	language: string;
	version: string;
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
				await localjudge.api.admin.piston.packages[
					props.installed ? "delete" : "post"
				]({
					language: props.language,
					version: props.version,
				});
				await router.invalidate({
					filter: (r) => r.fullPath === "/admin/languages",
				});
				setLoading(false);
			}}
		>
			{loading && <LucideLoader2 className="animate-spin" />}
			{props.installed ? "Remove" : "Install"}
		</Button>
	);
}

function PackageList() {
	const packages = Route.useLoaderData({ select: (data) => data.packages });
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Package</TableHead>
					<TableHead>Version</TableHead>
					<TableHead className="text-right">Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Object.entries(packages).map((pkg) =>
					pkg[1].map(({ version, installed }, i) => (
						<TableRow
							key={pkg[0] + version}
							className={cn(
								"hover:bg-transparent",
								i < pkg[1].length - 1 && "border-none",
							)}
						>
							{i === 0 && (
								<TableCell rowSpan={pkg[1].length}>{pkg[0]}</TableCell>
							)}
							<TableCell>{version}</TableCell>
							<TableCell className="text-right">
								<PackageActionButton
									language={pkg[0]}
									version={version}
									installed={installed}
								/>
							</TableCell>
						</TableRow>
					)),
				)}
			</TableBody>
		</Table>
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
