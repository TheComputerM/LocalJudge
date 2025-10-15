import { getRouteApi, useLoaderData } from "@tanstack/react-router";
import { createStore } from "@xstate/store";
import { create } from "mutative";
import { createContext, useContext, useEffect, useRef } from "react";
import { localjudge } from "@/api/client";

interface StoreContext {
	contest: string;
	problem: number;
	language: string;
	file: string;
	solutions: Record<number, Record<string, Record<string, string>>>;
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

const createSolutionStore = (initial: StoreContext) => {
	const store = createStore({
		context: initial,
		on: {
			init(
				ctx,
				event: {
					contest: string;
					problem: number;
					language: string;
					content: Record<string, string>;
				},
			) {
				return create(ctx, (draft) => {
					set(draft.solutions, [event.problem, event.language], event.content);
				});
			},

			param(
				_ctx,
				event: { key: keyof Omit<StoreContext, "solutions">; value: any },
				enqueue,
			) {
				const ctx = {
					..._ctx,
					[event.key]: event.value,
				};

				if (!ctx.solutions[ctx.problem]?.[ctx.language]?.[ctx.file]) {
					enqueue.effect(async () => {
						const { data } = await localjudge.api
							.contest({ id: ctx.contest })
							.problem({ problem: ctx.problem.toString() })
							.boilerplate({ language: ctx.language })
							.get();

						if (!data) return;

						store.trigger.init({
							contest: ctx.contest,
							problem: ctx.problem,
							language: ctx.language,
							content: data,
						});
					});
				}

				return ctx;
			},

			write(ctx, event: { content: string }) {
				return create(ctx, (draft) => {
					set(
						draft.solutions,
						[draft.problem, draft.language, draft.file],
						event.content,
					);
				});
			},
		},
	});

	return store;
};

type StoreAPI = ReturnType<typeof createSolutionStore>;

const StoreContext = createContext<StoreAPI | null>(null);

const Route = getRouteApi("/app/contest/$id/problem/$problem");

export const SolutionStoreProvider = (props: { children: React.ReactNode }) => {
	const ref = useRef<StoreAPI | null>(null);

	const contest = Route.useParams({ select: ({ id }) => id });
	const problem = Route.useParams({
		select: ({ problem }) => Number.parseInt(problem),
	});
	const language = useLoaderData({
		from: "/app/contest/$id",
		select: (data) => data.settings.languages[0],
	});

	if (ref.current === null) {
		ref.current = createSolutionStore({
			contest,
			problem,
			language,
			file: "@",
			solutions: {},
		});
	}

	useEffect(() => {
		ref.current?.trigger.param({ key: "contest", value: contest });
	}, [contest]);

	useEffect(() => {
		ref.current?.trigger.param({ key: "problem", value: problem });
	}, [problem]);

	return (
		<StoreContext.Provider value={ref.current}>
			{props.children}
		</StoreContext.Provider>
	);
};

export const useSolutionStore = () => {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error("SolutionStore not initialized");
	}
	return store;
};
