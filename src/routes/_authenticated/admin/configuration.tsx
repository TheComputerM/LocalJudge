import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import env from "@/lib/env";

const getEnvironmentFn = createServerFn({ method: "GET" }).handler(async () => {
	return env;
});

export const Route = createFileRoute("/_authenticated/admin/configuration")({
	loader: async () => {
		return { env: await getEnvironmentFn() };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { env } = Route.useLoaderData();
	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Server Configuration
			</h1>
			<Separator className="my-6" />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Key</TableHead>
						<TableHead>Value</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Object.entries(env).map(([key, value]) => (
						<TableRow key={key}>
							<TableCell>{key}</TableCell>
							<TableCell>{value}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
