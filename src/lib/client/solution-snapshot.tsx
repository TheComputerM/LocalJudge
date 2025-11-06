import { useAsyncDebouncer } from "@tanstack/react-pacer/async-debouncer";
import { useParams } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { LucideCircleCheckBig, LucideClock } from "lucide-react";
import { Fragment, useEffect } from "react";
import { localjudge } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { rejectError } from "../utils";
import { useSolutionStore } from "./solution-store";

export function SolutionSnapshotter() {
	const contestId = useParams({
		from: "/_authenticated/contest/$id/problem/$problem",
		select: ({ id }) => id,
	});
	const store = useSolutionStore();
	const solutions = useStore(store.solutions, (state) => state.solutions);
	const debouncer = useAsyncDebouncer(
		async (item: typeof solutions) => {
			console.log(item);
			await rejectError(
				localjudge.contest({ id: contestId }).snapshot.post(item),
			);
		},
		{
			wait: 4000,
		},
		(state) => ({
			isPending: state.isPending,
		}),
	);

	useEffect(() => {
		debouncer.maybeExecute(solutions);
	}, [solutions]);

	return (
		<Badge
			variant={debouncer.state.isPending ? "secondary" : "success"}
			size="sm"
		>
			{debouncer.state.isPending ? (
				<Fragment>
					<LucideClock /> saving...
				</Fragment>
			) : (
				<Fragment>
					<LucideCircleCheckBig />
					saved
				</Fragment>
			)}
		</Badge>
	);
}
