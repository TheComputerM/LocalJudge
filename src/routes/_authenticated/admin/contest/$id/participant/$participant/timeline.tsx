import { DiffEditor } from "@monaco-editor/react";
import { createFileRoute } from "@tanstack/react-router";
import { Store, useStore } from "@tanstack/react-store";
import { formatDuration, intervalToDuration } from "date-fns";
import { Patch, patchApply, patchFromText } from "diff-match-patch-es";
import { zip } from "es-toolkit/array";
import { get } from "es-toolkit/compat";
import { sum } from "es-toolkit/math";
import { mapValues } from "es-toolkit/object";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { localjudge } from "@/api/client";
import { useTheme } from "@/components/providers/theme";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute(
	"/_authenticated/admin/contest/$id/participant/$participant/timeline",
)({
	loader: async ({ params }) => {
		const [timeline, problems] = await Promise.all([
			rejectError(
				localjudge.admin
					.contest({ id: params.id })
					.participant({ participant: params.participant })
					.timeline.get(),
			),
			rejectError(localjudge.contest({ id: params.id }).problem.get()),
		]);

		return { timeline, problems };
	},
	component: RouteComponent,
});

const historyStore = new Store({
	selected: 0,
	language: "",
	problem: 1,
	patchsets: [] as Record<string, Record<number, Patch[]>>[],
});

function getPatchChange(patch: Patch): [number, number] {
	return patch.diffs.reduce(
		(acc, item) => {
			if (item[0] > 0) {
				acc[0] += item[1].length;
			} else if (item[0] < 0) {
				acc[1] += item[1].length;
			}
			return acc;
		},
		[0, 0],
	);
}

function PatchAmountBadge({
	added = 0,
	removed = 0,
}: {
	added: number;
	removed: number;
}) {
	return (
		<Fragment>
			<Badge size="sm" variant="success" className="rounded-e-none">
				+ {added}
			</Badge>
			<Badge size="sm" variant="error" className="rounded-s-none">
				- {removed}
			</Badge>
		</Fragment>
	);
}

const CheckpointItem = ({
	patchset,
	index,
}: {
	patchset: Record<string, Record<number, Patch[]>>;
	index: number;
}) => {
	const selected = useStore(historyStore, (state) => state.selected);
	const timeline = Route.useLoaderData({
		select: ({ timeline }) => timeline,
	});
	const contestStartTime = Route.useRouteContext({
		select: ({ contest }) => contest.startTime,
	});
	const [added, removed] = useMemo(() => {
		const scores = Object.values(patchset)
			.map((x) =>
				Object.values(x)
					.map((patch) => patch.map(getPatchChange))
					.flat(),
			)
			.flat();
		return zip(...scores).map(sum) as [number, number];
	}, [patchset]);

	return (
		<Item
			variant={selected === index ? "muted" : "default"}
			size="sm"
			onClick={() => {
				historyStore.setState((state) => ({ ...state, selected: index }));
			}}
			className="cursor-pointer"
		>
			<ItemContent className="text-left">
				<ItemTitle>{timeline[index].createdAt.toLocaleString()}</ItemTitle>
				<ItemDescription>
					after{" "}
					{formatDuration(
						intervalToDuration({
							start: contestStartTime,
							end: timeline[index].createdAt,
						}),
					)}
				</ItemDescription>
			</ItemContent>
			<ItemActions className="gap-0">
				<PatchAmountBadge added={added} removed={removed} />
			</ItemActions>
		</Item>
	);
};

function Checkpoints() {
	const patchsets = useStore(historyStore, (state) => state.patchsets);

	if (patchsets.length === 0) {
		return (
			<div className="h-64 flex justify-center items-center">
				<Spinner />
			</div>
		);
	}

	return (
		<ItemGroup className="gap-2">
			{patchsets.map((patchset, i) => (
				<CheckpointItem key={i} patchset={patchset} index={i} />
			))}
		</ItemGroup>
	);
}

function DiffViewer() {
	const [theme] = useTheme();
	const history = useStore(historyStore);

	const [original, modified] = useMemo(() => {
		const originalPatchset = history.patchsets
			.slice(0, history.selected)
			.map((patchset) =>
				get(patchset, [history.language, history.problem], [] as Patch[]),
			)
			.flat();
		const [original] = patchApply(originalPatchset, "") as [string, boolean[]];
		const modifiedPatchset = get(
			history.patchsets.at(history.selected),
			[history.language, history.problem],
			[] as Patch[],
		);
		const [modified] = patchApply(modifiedPatchset, original) as [
			string,
			boolean[],
		];
		return [original, modified];
	}, [history]);

	return (
		<DiffEditor
			theme={theme === "dark" ? "vs-dark" : "light"}
			original={original}
			modified={modified}
			originalModelPath={`${history.language}/${history.problem}/original`}
			modifiedModelPath={`${history.language}/${history.problem}/modified`}
			language={history.language}
			options={{ readOnly: true, minimap: { enabled: false } }}
		/>
	);
}

function LanguageSelector() {
	const languages = Route.useRouteContext({
		select: ({ contest }) => contest.settings.languages,
	});
	useEffect(() => {
		historyStore.setState((state) => ({ ...state, language: languages[0] }));
	}, [languages]);
	const history = useStore(historyStore);

	const getChangeAmount = useCallback(
		(language: string) => {
			const patchset = history.patchsets.at(history.selected);
			const changes = get(
				patchset,
				[language, history.problem],
				[] as Patch[],
			).map(getPatchChange);
			const [added, removed] = zip(...changes).map(sum);
			return { added, removed };
		},
		[history],
	);

	return (
		<Select
			value={history.language}
			onValueChange={(language) =>
				historyStore.setState((state) => ({ ...state, language }))
			}
		>
			<SelectTrigger className="w-min">
				<SelectValue />
			</SelectTrigger>
			<SelectPopup>
				{languages.map((language) => (
					<SelectItem key={language} value={language}>
						<div className="w-full inline-flex items-center justify-between">
							{language}
							<div className="inline-flex items-center ml-2">
								<PatchAmountBadge {...getChangeAmount(language)} />
							</div>
						</div>
					</SelectItem>
				))}
			</SelectPopup>
		</Select>
	);
}

function ProblemSelector() {
	const problems = Route.useLoaderData({ select: ({ problems }) => problems });
	const items = useMemo(
		() =>
			problems.map(({ number, title }) => ({ value: number, label: title })),
		[problems],
	);
	const history = useStore(historyStore);

	const getChangeAmount = useCallback(
		(problem: number) => {
			const patchset = history.patchsets.at(history.selected);
			const changes = get(
				patchset,
				[history.language, problem],
				[] as Patch[],
			).map(getPatchChange);
			const [added, removed] = zip(...changes).map(sum);
			return { added, removed };
		},
		[history],
	);

	return (
		<Select
			items={items}
			value={history.problem}
			onValueChange={(problem) =>
				historyStore.setState((state) => ({ ...state, problem }))
			}
		>
			<SelectTrigger className="w-min">
				<SelectValue />
			</SelectTrigger>
			<SelectPopup>
				{items.map(({ label, value }) => (
					<SelectItem key={value} value={value}>
						<div className="w-full inline-flex items-center justify-between">
							{label}
							<div className="inline-flex items-center ml-2">
								<PatchAmountBadge {...getChangeAmount(value)} />
							</div>
						</div>
					</SelectItem>
				))}
			</SelectPopup>
		</Select>
	);
}

function RouteComponent() {
	const timeline = Route.useLoaderData({ select: ({ timeline }) => timeline });

	useEffect(() => {
		historyStore.setState((prev) => ({
			...prev,
			patchsets: timeline.map((entry) =>
				mapValues(entry.patch, (problem) =>
					mapValues(problem, (patchText) => patchFromText(patchText)),
				),
			),
		}));
	}, [timeline]);

	return (
		<div className="flex flex-wrap gap-3 min-h-svh">
			<div className="basis-80 rounded-lg bg-card self-start">
				<ScrollArea className="max-h-svh p-2">
					<Checkpoints />
				</ScrollArea>
			</div>
			<div className="flex flex-col gap-2 grow">
				<div className="flex gap-2">
					<LanguageSelector />
					<ProblemSelector />
				</div>
				<div className="grow rounded-md overflow-hidden">
					<DiffViewer />
				</div>
			</div>
		</div>
	);
}
