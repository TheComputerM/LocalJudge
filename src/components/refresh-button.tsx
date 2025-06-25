import { useRouter } from "@tanstack/react-router";
import { LucideRefreshCw } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function RefreshButton({
	className,
	...props
}: ComponentProps<typeof Button>) {
	const router = useRouter();
	return (
		<Button
			size="icon"
			variant="ghost"
			{...props}
			className={cn("rounded-full", className)}
			onClick={() => router.invalidate()}
		>
			<LucideRefreshCw />
		</Button>
	);
}
