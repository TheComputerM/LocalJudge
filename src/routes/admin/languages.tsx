import { createFileRoute, useRouter } from "@tanstack/react-router";
import { LucideDownload, LucideLoader2, LucideTrash } from "lucide-react";
import { Suspense, use, useState } from "react";
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
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/languages")({
	loader: async () => {
		const enginesPromise = rejectError(localjudge.localbox.engine.get());

		return { enginesPromise };
	},
	component: RouteComponent,
});

function EngineAction({
	name,
	installed,
}: {
	name: string;
	installed: boolean;
}) {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	return (
		<Button
			size="sm"
			variant={installed ? "destructive" : "default"}
			disabled={loading}
			onClick={async () => {
				setLoading(true);
				await localjudge.localbox
					.engine({ engine: name })
					[installed ? "delete" : "post"]();
				setLoading(false);
				router.invalidate({ filter: (d) => d.id === Route.id });
			}}
		>
			{loading ? (
				<LucideLoader2 className="animate-spin" />
			) : installed ? (
				<LucideTrash />
			) : (
				<LucideDownload />
			)}
			{installed ? "Uninstall" : "Install"}
		</Button>
	);
}

function EngineList() {
	const enginesPromise = Route.useLoaderData({
		select: (data) => data.enginesPromise,
	});
	const engines = use(enginesPromise);
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Version</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{Object.entries(engines).map(([name, engine]) => (
					<TableRow key={name}>
						<TableCell>{name}</TableCell>
						<TableCell>{engine.version}</TableCell>
						<TableCell className="text-right">
							<EngineAction name={name} installed={engine.installed} />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function RouteComponent() {
	return (
		<div className="grid gap-6">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Engines
			</h1>
			<Suspense fallback="Loading...">
				<EngineList />
			</Suspense>
		</div>
	);
}
