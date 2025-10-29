import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function StatsGrid({
	data,
}: {
	data: { name: string; value: string; change?: string }[];
}) {
	return (
		<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
			{data.map((stat) => (
				<Card key={stat.name}>
					<CardHeader className="px-6">
						<CardDescription>{stat.name}</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{stat.value}
						</CardTitle>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
