import { useLoaderData, useParams } from "@tanstack/react-router";
import { Derived, Store } from "@tanstack/react-store";
import { get, has, setWith } from "es-toolkit/compat";
import { create } from "mutative";
import { createContext, useContext, useEffect, useRef } from "react";
import { localjudge } from "@/api/client";
import { ContestModel } from "@/api/contest/model";

interface SolutionStoreContext {
	contest: string;
	problem: number;
	language: string;
}

const createSolutionStore = (initial: SolutionStoreContext) => {
	const solutions = new Store({
		solutions: {} as typeof ContestModel.snapshot.static,
	});

	const selected = new Store(initial, {
		onUpdate: async () => {
			const p = selected.state;
			if (!has(solutions.state.solutions, [p.language, p.problem])) {
				// fetch new data if doesn't exist
				const { data } = await localjudge
					.contest({ id: p.contest })
					.problem({ problem: p.problem })
					.snapshot({ language: p.language })
					.get();
				if (!data) return;
				solutions.setState((prev) =>
					create(prev, (draft) => {
						setWith(draft.solutions, [p.language, p.problem], data, Object);
					}),
				);
			}
		},
	});

	const content = new Derived({
		deps: [selected, solutions],
		fn: ({ currDepVals }) => {
			const p = currDepVals[0];
			return get(currDepVals[1].solutions, [p.language, p.problem], "");
		},
	});

	function setContent(content: string) {
		solutions.setState((prev) =>
			create(prev, (draft) => {
				setWith(
					draft.solutions,
					[selected.state.language, selected.state.problem],
					content,
					Object,
				);
			}),
		);
	}

	return { solutions, selected, content, setContent };
};

type StoreAPI = ReturnType<typeof createSolutionStore>;

const SolutionStoreContext = createContext<StoreAPI | null>(null);
export const useSolutionStore = () => {
	const store = useContext(SolutionStoreContext);
	if (!store) {
		throw new Error("SolutionStore not initialized");
	}
	return store;
};

export const SolutionStoreProvider = (props: { children: React.ReactNode }) => {
	const ref = useRef<StoreAPI | null>(null);

	const params = useParams({
		from: "/_authenticated/contest/$id/problem/$problem",
		select: ({ id, problem }) => ({
			contest: id,
			problem: Number.parseInt(problem),
		}),
	});

	const language = useLoaderData({
		from: "/_authenticated/contest/$id",
		select: (data) => data.settings.languages[0],
	});

	if (ref.current === null) {
		ref.current = createSolutionStore({
			...params,
			language,
		});
	}

	useEffect(() => {
		const unmount = ref.current?.content.mount();
		return () => unmount?.();
	}, []);

	useEffect(() => {
		ref.current?.selected.setState((prev) => ({ ...prev, ...params }));
	}, [params]);

	return (
		<SolutionStoreContext.Provider value={ref.current}>
			{props.children}
		</SolutionStoreContext.Provider>
	);
};
