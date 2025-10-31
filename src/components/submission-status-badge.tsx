import { useQuery } from "@tanstack/react-query";
import { LucideCheckCircle, LucideXCircle } from "lucide-react";
import { $localjudge } from "@/api/fetch";
import { rejectError } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";

/**
 * A badge component that shows the number of testcases passed / total
 * for a submission.
 */
export function SubmissionStatusBadge(props: { id: string }) {
	const { data, isLoading, isError } = useQuery({
		queryKey: [
			"/api/submission/:submission/status",
			{
				submission: props.id,
			},
		] as const,
		queryFn: async ({ queryKey: [url, params] }) =>
			rejectError(
				$localjudge(url, {
					method: "GET",
					params,
				}),
			),
	});

	if (isLoading) {
		return (
			<Badge variant="secondary" className="rounded gap-2 animate-pulse">
				<Spinner className="size-3" /> ...
			</Badge>
		);
	}

	if (isError || !data) {
		return <Badge variant="destructive">fetch error</Badge>;
	}

	return (
		<Badge variant="secondary" className="gap-2 rounded">
			{data.state !== "done" ? (
				<Spinner className="size-3 text-amber-600 dark:text-amber-400" />
			) : data.passed === data.total ? (
				<LucideCheckCircle className="size-3 text-emerald-600 dark:text-emerald-400" />
			) : (
				<LucideXCircle className="size-3 text-destructive" />
			)}
			{data.state === "pending"
				? "queued..."
				: `${data.passed} / ${data.total}`}
		</Badge>
	);
}
