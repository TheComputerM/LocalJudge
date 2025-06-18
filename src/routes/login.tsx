// TODO: need to fix and refactor login page
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-screen items-center justify-center bg-muted">
			<LoginForm />
		</div>
	);
}

function LoginForm() {
	const [email, setEmail] = useState("admin@admin.com");
	const [password, setPassword] = useState("admin");
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
				<CardContent>
					<form
						onSubmit={async () => {
							await authClient.signIn.email(
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
									onSuccess: async () => {
										await router.invalidate();
										await router.navigate({
											to: "/admin",
										});
									},
									onError: ({ error: { message } }) => {
										alert(`login error: ${message}`);
									},
								},
							);
						}}
					>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<Button type="submit" className="w-full" disabled={loading}>
									Login
								</Button>
								{/* TODO: display social login buttons depending on config */}
								<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
									<span className="bg-background text-muted-foreground relative z-10 px-2">
										or continue with
									</span>
								</div>
								<Button type="button" variant="outline" className="w-full">
									Login with Google
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
