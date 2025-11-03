import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LucideRefreshCw } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

/**
 * A button component that invalidates and refreshes the entire site.
 */
export function RefreshButton({
	className,
	...props
}: ComponentProps<typeof Button>) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const queryClient = useQueryClient();
	return (
		<Button
			size="icon"
			variant="ghost"
			{...props}
			className={cn("rounded-full", className)}
			onClick={async () => {
				setLoading(true);
				await router.invalidate({ sync: true });
				await queryClient.invalidateQueries();
				setLoading(false);
			}}
		>
			<LucideRefreshCw className={cn(loading && "animate-spin")} />
		</Button>
	);
}
