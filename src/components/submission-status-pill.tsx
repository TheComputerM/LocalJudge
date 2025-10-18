import { LucideCheckCircle, LucideXCircle } from "lucide-react";
import { Pill, PillStatus } from "./kibo-ui/pill";

export function SubmissionStatusPill(props: { passed: number; total: number }) {
	return (
		<Pill>
			<PillStatus>
				{props.passed === props.total ? (
					<LucideCheckCircle size={12} className="text-emerald-500" />
				) : (
					<LucideXCircle size={12} className="text-destructive" />
				)}
			</PillStatus>
			{props.passed} / {props.total}
		</Pill>
	);
}
