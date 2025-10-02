import { createFileRoute } from "@tanstack/react-router";
import { Suspense, use } from "react";
import { localjudge } from "@/api/client";
import { Table, TableHead, TableHeader } from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/languages")({
	loader: async () => {
		const packagesPromise = rejectError(localjudge.api.localbox.engine.get());

		return { packagesPromise };
	},
	component: RouteComponent,
});

function PackageList() {
	const packagesPromise = Route.useLoaderData({
		select: (data) => data.packagesPromise,
	});
	const packages = use(packagesPromise);
	return (
		<Table>
			<TableHeader>
				<TableHead>Package</TableHead>
			</TableHeader>
		</Table>
	);
}

function RouteComponent() {
	return (
		<div className="grid gap-6">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Packages
			</h1>
			<Suspense fallback="Loading...">
				<PackageList />
			</Suspense>
		</div>
	);
}
