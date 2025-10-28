import { LucideCheckCircle, LucideXCircle } from "lucide-react";
import useSWR from "swr";
import { $localjudge } from "@/api/fetch";
import { rejectError } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";

/**
 * A badge component that shows the number of testcases passed / total
 * for a submission.
 */
export function SubmissionStatusBadge(props: { id: string }) {
	const { data, isLoading } = useSWR(
		[
			"/api/submission/:submission/status" as const,
			{
				submission: props.id,
			},
		],
		([url, params]) =>
			rejectError(
				$localjudge(url, {
					method: "GET",
					params,
				}),
			),
	);

	return (
		<Badge variant="secondary" className="gap-2 rounded">
			{isLoading ? (
				<Spinner className="size-3 text-amber-500" />
			) : data && data.passed === data.total ? (
				<LucideCheckCircle className="size-3 text-emerald-600 dark:text-emerald-400" />
			) : (
				<LucideXCircle className="size-3 text-destructive" />
			)}
			{isLoading ? "- / -" : data ? `${data.passed} / ${data.total}` : "error"}
		</Badge>
	);
}
