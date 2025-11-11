import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserWithRole } from "better-auth/plugins";
import {
	LucideActivity,
	LucideBan,
	LucideCircleCheck,
	LucideTrash,
	LucideUser,
} from "lucide-react";
import { UAParser } from "ua-parser-js";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/client";
import { rejectError } from "@/lib/utils";

// TODO: add https://tanstack.com/router/latest/docs/integrations/query

export const Route = createFileRoute("/_authenticated/admin/user/$user")({
	component: RouteComponent,
});

function BanUser() {
	return (
		<Item variant="outline">
			<ItemContent>
				<ItemTitle>Ban User</ItemTitle>
				<ItemDescription>
					Prevent this user from logging in or making submissions.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button>
					<LucideBan />
					Ban User
				</Button>
			</ItemActions>
		</Item>
	);
}

function UnbanUser() {
	return (
		<Item variant="outline">
			<ItemContent>
				<ItemTitle>Unban User</ItemTitle>
				<ItemDescription>
					This user is currently banned, unban them to allow them to log in and
					participate in contests.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button>
					<LucideCircleCheck />
					Unban User
				</Button>
			</ItemActions>
		</Item>
	);
}

function DeleteUser() {
	const userId = Route.useParams({ select: ({ user }) => user });
	const navigate = Route.useNavigate();
	return (
		<Item variant="outline" className="border-destructive">
			<ItemContent>
				<ItemTitle>Delete User</ItemTitle>
				<ItemDescription>
					Permanently remove this user and all of their submissions. This action
					is not reversible, so please continue with caution.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<ConfirmActionDialog
					onConfirm={async () => {
						await rejectError(authClient.admin.removeUser({ userId }));
						navigate({ to: "/admin/user", replace: true });
					}}
					trigger={
						<Button variant="destructive">
							<LucideTrash />
							Delete User
						</Button>
					}
				/>
			</ItemActions>
		</Item>
	);
}

function getDeviceUserAgent(agent?: string) {
	if (!agent) return "Unknown Device";
	const { browser, os } = UAParser(agent);
	return `${browser} (${os.name})`;
}

function UserSessions() {
	const userId = Route.useParams({ select: ({ user }) => user });
	const { data, error, isLoading, refetch } = useQuery({
		queryKey: ["user", userId, "sessions"],
		queryFn: async ({ queryKey }) =>
			rejectError(
				authClient.admin.listUserSessions({ userId: queryKey[1] }),
			).then(({ sessions }) => sessions),
	});

	if (isLoading) {
		return <Skeleton className="h-16" />;
	}

	if (error || data === undefined) {
		return (
			<Alert>
				<AlertTitle>Error loading sessions</AlertTitle>
				<AlertDescription>{JSON.stringify(error)}</AlertDescription>
			</Alert>
		);
	}

	return (
		<ItemGroup className="gap-2">
			{data.length > 0 ? (
				data.toReversed().map((session) => (
					<Item key={session.id} variant="outline">
						<ItemContent>
							<ItemTitle>
								{getDeviceUserAgent(session.userAgent ?? undefined)}
							</ItemTitle>
							<ItemDescription>
								last updated: {session.updatedAt.toLocaleString()}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button
								size="sm"
								onClick={async () => {
									await authClient.admin.revokeUserSession({
										sessionToken: session.token,
									});
									await refetch();
								}}
							>
								Revoke
							</Button>
						</ItemActions>
					</Item>
				))
			) : (
				<p>No active sessions</p>
			)}
		</ItemGroup>
	);
}

function RouteComponent() {
	const userId = Route.useParams({ select: ({ user }) => user });
	const { data, error, isLoading } = useQuery({
		queryKey: ["user", userId],
		queryFn: async ({ queryKey }) =>
			rejectError(
				authClient.admin.getUser({
					query: { id: queryKey[1] },
				}),
			) as Promise<UserWithRole>,
	});

	if (isLoading) {
		return (
			<div className="h-svh flex items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (error || data === undefined) {
		return (
			<Alert>
				<AlertTitle>Error loading user</AlertTitle>
				<AlertDescription>{JSON.stringify(error)}</AlertDescription>
			</Alert>
		);
	}

	return (
		<Tabs
			defaultValue="account"
			orientation="vertical"
			className="w-full flex-row gap-6"
		>
			<TabsList className="flex-col h-full items-stretch sticky top-4">
				<TabsTrigger value="account" className="justify-start">
					<LucideUser />
					Account
				</TabsTrigger>
				<TabsTrigger value="activity" className="justify-start">
					<LucideActivity />
					Activity
				</TabsTrigger>
			</TabsList>
			<div className="grow px-4">
				<TabsContent value="account" className="grid gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{data.name}</CardTitle>
							<CardDescription>{data.email}</CardDescription>
							<CardAction>
								<Avatar>
									<AvatarImage src={data.image ?? undefined} />
									<AvatarFallback>
										{data.name
											.split(" ")
											.slice(0, 2)
											.map((n) => n.charAt(0))
											.join("")}
									</AvatarFallback>
								</Avatar>
							</CardAction>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Sessions</CardTitle>
							<CardDescription>Active sessions for this user.</CardDescription>
						</CardHeader>
						<CardContent>
							<UserSessions />
						</CardContent>
					</Card>
					{data.banned ? <UnbanUser /> : <BanUser />}
					<DeleteUser />
				</TabsContent>
				<TabsContent value="activity">TODO</TabsContent>
			</div>
		</Tabs>
	);
}
