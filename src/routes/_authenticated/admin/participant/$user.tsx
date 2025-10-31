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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/client";
import { rejectError } from "@/lib/utils";

// TODO: add https://tanstack.com/router/latest/docs/integrations/query

export const Route = createFileRoute("/_authenticated/admin/participant/$user")(
	{
		component: RouteComponent,
	},
);

function BanUser({ id }: { id: string }) {
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

function UnbanUser({ id }: { id: string }) {
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

function DeleteUser({ id }: { id: string }) {
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
						await rejectError(
							authClient.admin.removeUser({
								userId: id,
							}),
						);
						navigate({ to: "/admin/participant", replace: true });
					}}
				>
					<Button variant="destructive">
						<LucideTrash />
						Delete User
					</Button>
				</ConfirmActionDialog>
			</ItemActions>
		</Item>
	);
}

function getDeviceUserAgent(agent?: string) {
	if (!agent) return "Unknown Device";
	const { browser, os } = UAParser(agent);
	return `${browser} (${os.name})`;
}

function UserSessions({ id }: { id: string }) {
	const { data, isError, isLoading, refetch } = useQuery({
		queryKey: ["auth", "user", id, "sessions"],
		queryFn: async () =>
			rejectError(authClient.admin.listUserSessions({ userId: id })).then(
				({ sessions }) => sessions,
			),
	});

	if (isLoading) {
		return <Skeleton className="h-16" />;
	}

	if (isError || !data) {
		return (
			<div className="text-destructive-foreground">Error loading sessions</div>
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
		queryKey: ["auth", "participant", userId],
		queryFn: async ({ queryKey }) =>
			rejectError(
				authClient.admin.getUser({
					query: { id: queryKey[2] },
				}),
			) as Promise<UserWithRole>,
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error || !data) {
		return <div>Error loading user: {JSON.stringify(error)}</div>;
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
							<UserSessions id={data.id} />
						</CardContent>
					</Card>
					{data.banned ? <UnbanUser id={data.id} /> : <BanUser id={data.id} />}
					<DeleteUser id={data.id} />
				</TabsContent>
				<TabsContent value="activity">TODO</TabsContent>
			</div>
		</Tabs>
	);
}
