import { useAsyncDebouncer } from "@tanstack/react-pacer/async-debouncer";
import { useParams } from "@tanstack/react-router";
import { Store, useStore } from "@tanstack/react-store";
import { get } from "es-toolkit/compat";
import { LucideClock, LucideCloudCheck } from "lucide-react";
import { create } from "mutative";
import { Fragment, useEffect } from "react";
import { localjudge } from "@/api/client";
import { ContestModel } from "@/api/contest/model";
import { Badge } from "@/components/ui/badge";
import { toastManager } from "@/components/ui/toast";
import { rejectError } from "../utils";

export const solutionStore = new Store(
	{} as typeof ContestModel.snapshot.static,
);

export function setStoreContent(
	language: string,
	problem: number,
	content: string,
) {
	solutionStore.setState((prev) =>
		create(prev, (draft) => {
			draft[language] ??= {};
			draft[language][problem] = content;
		}),
	);
}

export async function createSubmission(
	contest: string,
	problem: number,
	language: string,
) {
	const toastId = toastManager.add({
		title: "Submission in progress...",
		type: "loading",
	});

	const content = get(solutionStore.state, [language, problem], undefined);

	if (content === undefined) {
		return;
	}

	const { data: results, error } = await localjudge
		.contest({ id: contest })
		.problem({ problem })
		.submit({ language })
		.post(content);

	if (error) {
		toastManager.update(toastId, {
			title: "Submission failed",
			description: JSON.stringify(error),
			type: "error",
		});
		return;
	}

	let passed = 0;
	let failed = 0;
	for await (const { data } of results) {
		if (data.status === "CA") {
			passed += 1;
		} else {
			failed += 1;
		}
		toastManager.update(toastId, {
			title: `${passed} / ${passed + failed} testcases till now`,
			type: "loading",
		});
	}
	toastManager.update(toastId, {
		title: `${passed} / ${passed + failed} testcases`,
		type: failed === 0 ? "success" : "error",
	});
}

export function SolutionSnapshotter() {
	const contestId = useParams({
		from: "/_authenticated/contest/$id/problem/$problem",
		select: ({ id }) => id,
	});
	const solutions = useStore(solutionStore);
	const debouncer = useAsyncDebouncer(
		async (item: typeof solutions) => {
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
					<LucideCloudCheck />
					saved
				</Fragment>
			)}
		</Badge>
	);
}

// if (!has(solutions.state.solutions, [p.language, p.problem])) {
// 	// fetch new data if doesn't exist
// 	const { data } = await localjudge
// 		.contest({ id: p.contest })
// 		.problem({ problem: p.problem })
// 		.snapshot({ language: p.language })
// 		.get();
// 	if (!data) return;
// 	solutions.setState((prev) =>
// 		create(prev, (draft) => {
// 			setWith(draft.solutions, [p.language, p.problem], data, Object);
// 		}),
// 	);
// }
