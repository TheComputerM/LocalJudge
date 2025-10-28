import { useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { Fragment, useState } from "react";
import { SiFacebook, SiGithub, SiGoogle } from "react-icons/si";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth/client";

const getProvidersFn = createServerFn({ method: "GET" }).handler(async () => {
	return Object.keys(auth.options.socialProviders);
});

function SocialLogin() {
	const router = useRouter();
	const getProviders = useServerFn(getProvidersFn);
	const { data, isLoading, error } = useSWR("social-providers", getProviders);
	const icons: Record<string, React.ReactElement> = {
		google: <SiGoogle />,
		github: <SiGithub />,
		facebook: <SiFacebook />,
	};

	if (isLoading) return <Spinner className="mx-auto my-2" />;
	if (!data)
		return (
			<div className="text-destructive-foreground">
				Error loading providers: {JSON.stringify(error)}
			</div>
		);

	if (data.length === 0) return null;

	return (
		<Fragment>
			<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
				<span className="bg-card text-muted-foreground relative z-10 px-2">
					or continue with
				</span>
			</div>
			<div className="flex gap-3 flex-wrap">
				{data.map((provider) => (
					<Button
						key={provider}
						className="flex-1"
						variant="outline"
						type="button"
						onClick={async () => {
							await authClient.signIn.social(
								{
									provider,
								},
								{
									onSuccess: async () => {
										router.invalidate();
									},
								},
							);
						}}
					>
						{icons[provider] ?? provider.toUpperCase()}
					</Button>
				))}
			</div>
		</Fragment>
	);
}

export function LoginForm() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	return (
		<div className="flex flex-col gap-6 w-full max-w-sm">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome</CardTitle>
					<CardDescription>
						Contact your administrator if you have trouble logging in.
					</CardDescription>
				</CardHeader>
				<form
					className="contents"
					onSubmit={async (e) => {
						e.preventDefault();
						e.stopPropagation();
						const formData = new FormData(e.currentTarget);
						const email = formData.get("email") as string;
						const password = formData.get("password") as string;
						authClient.signIn.email(
							{
								email,
								password,
							},
							{
								onRequest: () => {
									setLoading(true);
								},
								onResponse: () => {
									setLoading(false);
								},
								onSuccess: () => {
									router.invalidate();
								},
								onError: (ctx) => {
									console.log(ctx);
									alert(`login error: ${(ctx as any).responseText}`);
								},
							},
						);
					}}
				>
					<CardContent>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input id="password" name="password" type="password" required />
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex-col gap-4 items-normal">
						<Button type="submit" className="w-full" disabled={loading}>
							Login
						</Button>
						<SocialLogin />
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
