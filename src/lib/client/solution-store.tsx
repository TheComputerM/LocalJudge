import { getRouteApi, useLoaderData } from "@tanstack/react-router";
import { Derived, Store } from "@tanstack/react-store";
import { create } from "mutative";
import { createContext, useContext, useEffect, useRef } from "react";
import { localjudge } from "@/api/client";

interface SolutionStoreContext {
	contest: string;
	problem: number;
	language: string;
}

function set(obj: object, path: (string | number)[], value: any) {
	let current = obj as any;
	for (let i = 0; i < path.length - 1; i++) {
		const part = path[i];
		current[part] ??= {};
		current = current[part];
	}
	current[path[path.length - 1]] = value;
}

const createSolutionStore = (initial: SolutionStoreContext) => {
	const solutions = new Store({
		solutions: {} as Record<number, Record<string, string>>,
	});

	const selected = new Store(initial, {
		onUpdate: async () => {
			const p = selected.state;
			if (!solutions.state.solutions[p.problem]?.[p.language]) {
				// fetch new data if doesn't exist
				const { data } = await localjudge
					.contest({ id: p.contest })
					.problem({
						problem: p.problem,
					})
					.boilerplate({
						language: p.language,
					})
					.get();
				if (!data) return;
				solutions.setState((prev) =>
					create(prev, (draft) => {
						set(draft.solutions, [p.problem, p.language], data);
					}),
				);
			}
		},
	});

	const content = new Derived({
		deps: [selected, solutions],
		fn: () => {
			const p = selected.state;
			return solutions.state.solutions[p.problem]?.[p.language] ?? "";
		},
	});

	function setContent(content: string) {
		solutions.setState((prev) =>
			create(prev, (draft) => {
				set(
					draft.solutions,
					[selected.state.problem, selected.state.language],
					content,
				);
			}),
		);
	}

	return { selected, content, setContent };
};

type StoreAPI = ReturnType<typeof createSolutionStore>;

const SolutionStoreContext = createContext<StoreAPI | null>(null);

const Route = getRouteApi("/_authenticated/contest/$id/problem/$problem");

export const SolutionStoreProvider = (props: { children: React.ReactNode }) => {
	const ref = useRef<StoreAPI | null>(null);

	const contest = Route.useParams({ select: ({ id }) => id });
	const problem = Route.useParams({
		select: ({ problem }) => Number.parseInt(problem),
	});
	const language = useLoaderData({
		from: "/_authenticated/contest/$id",
		select: (data) => data.settings.languages[0],
	});

	if (ref.current === null) {
		ref.current = createSolutionStore({
			contest,
			problem,
			language,
		});
	}

	useEffect(() => {
		const unmount = ref.current?.content.mount();
		return () => unmount?.();
	}, []);

	useEffect(() => {
		ref.current?.selected.setState((prev) => ({ ...prev, contest }));
	}, [contest]);

	useEffect(() => {
		ref.current?.selected.setState((prev) => ({ ...prev, problem }));
	}, [problem]);

	return (
		<SolutionStoreContext.Provider value={ref.current}>
			{props.children}
		</SolutionStoreContext.Provider>
	);
};

export const useSolutionStore = () => {
	const store = useContext(SolutionStoreContext);
	if (!store) {
		throw new Error("SolutionStore not initialized");
	}
	return store;
};
