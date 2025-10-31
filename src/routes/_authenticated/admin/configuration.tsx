import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import env from "@/lib/env";

const getEnvironmentFn = createServerFn({ method: "GET" }).handler(async () => {
	return env;
});

const getAuthProvidersFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const config = auth.options.socialProviders as Record<
			string,
			Record<string, string>
		>;
		return Object.entries(config).map(
			([provider, values]) => [provider, Object.entries(values)] as const,
		);
	},
);

export const Route = createFileRoute("/_authenticated/admin/configuration")({
	loader: async () => {
		const [env, providers] = await Promise.all([
			getEnvironmentFn(),
			getAuthProvidersFn(),
		]);
		return { env, providers };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { env, providers } = Route.useLoaderData();
	return (
		<div className="flex flex-col gap-6">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Server Configuration
			</h1>
			<Separator />
			<Card>
				<CardHeader>
					<CardTitle>Environment Variables</CardTitle>
					<CardDescription>
						These are the values of the environment variables set for this
						instance of LocalJudge.
					</CardDescription>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Authentication Providers</CardTitle>
					<CardDescription>
						These are the active social authentication providers. You can
						configure them through editing the providers.json file.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Provider</TableHead>
								<TableHead>Secrets</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{providers.map(([provider, config]) => (
								<TableRow key={provider}>
									<TableCell>{provider}</TableCell>
									<TableCell>
										<ul>
											{config.map(([key, value]) => (
												<li key={key}>
													{key}: {value}
												</li>
											))}
										</ul>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
