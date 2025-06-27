import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { LucideDownload, LucideLoader2, LucideTrash } from "lucide-react";
import { useRef, useState } from "react";
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
import { cn, rejectError } from "@/lib/utils";

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

/**
 * Recursively get offset from top of page for element
 */
const getOffsetTop = (element: HTMLElement | null) => {
	let offsetTop = 0;
	while (element) {
		offsetTop += element.offsetTop;
		element = element.offsetParent as HTMLElement | null;
	}
	return offsetTop;
};

function PackageList() {
	const packages = Route.useLoaderData({ select: (data) => data.packages });
	const tableBodyRef = useRef<HTMLDivElement | null>(null);

	const virtualizer = useWindowVirtualizer({
		count: packages.length,
		estimateSize: () => 56,
		scrollMargin: tableBodyRef.current ? getOffsetTop(tableBodyRef.current) : 0,
		overscan: 5,
	});

	return (
		<div>
			<div
				ref={tableBodyRef}
				className="w-full relative"
				style={{
					height: `${virtualizer.getTotalSize()}px`,
					position: "relative",
				}}
			>
				{virtualizer.getVirtualItems().map((item) => (
					<div
						key={item.key}
						className={cn(
							"absolute w-full flex items-center justify-between px-4",
							item.index % 2 && "bg-muted rounded-lg",
						)}
						style={{
							top: 0,
							left: 0,
							height: `${item.size}px`,
							transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
						}}
					>
						<div>
							<span>{packages[item.index].language}</span>
							<Badge className="ml-2">
								{packages[item.index].language_version}
							</Badge>
						</div>
						<PackageActionButton {...packages[item.index]} />
					</div>
				))}
			</div>
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
