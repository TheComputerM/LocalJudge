import { Link, useRouter } from "@tanstack/react-router";
import { LucideLogOut, LucideShieldUser } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import {
	Menu,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuTrigger,
} from "../ui/menu";

/**
 * A button component that signs the user out.
 */
export function UserProfile() {
	const router = useRouter();
	async function signOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.invalidate();
				},
			},
		});
	}

	const { data, isPending } = authClient.useSession();

	if (isPending || !data) {
		return <Skeleton className="size-8 rounded-full" />;
	}

	return (
		<Menu>
			<MenuTrigger
				render={
					<Button
						size="icon"
						className="size-fit rounded-full cursor-pointer"
						variant="ghost"
					/>
				}
			>
				<Avatar>
					<AvatarFallback>
						{data.user.name
							.split(" ")
							.slice(0, 2)
							.map((n) => n[0])
							.join("")
							.toUpperCase()}
					</AvatarFallback>
					<AvatarImage
						src={data.user.image ?? undefined}
						alt={data.user.name}
					/>
				</Avatar>
			</MenuTrigger>
			<MenuPopup align="end">
				<div className="flex flex-col p-2 gap-px">
					<span className="text-sm font-medium">{data.user.name}</span>
					<span className="text-xs text-muted-foreground">
						{data.user.email}
					</span>
				</div>
				<MenuSeparator />
				{data.user.role?.includes("admin") && (
					<MenuItem render={<Link to="/admin" />}>
						<LucideShieldUser />
						Admin
					</MenuItem>
				)}
				<MenuItem onClick={signOut}>
					<LucideLogOut /> Sign Out
				</MenuItem>
			</MenuPopup>
		</Menu>
	);
}
