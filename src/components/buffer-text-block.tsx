import { LucideCheck, LucideCopy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

function CopyButton({ content }: { content: string }) {
	const [copy, isCopied] = useCopyToClipboard();
	return (
		<button onClick={() => copy(content)}>
			{isCopied ? (
				<LucideCheck className="size-3" />
			) : (
				<LucideCopy className="size-3" />
			)}
		</button>
	);
}

export function BufferTextBlock({
	className,
	label,
	children,
}: {
	className?: string;
	label: string;
	children: string;
}) {
	return (
		<div className={cn("bg-muted/75 p-4 rounded-md", className)}>
			<div className="flex justify-between items-center">
				<span className="text-muted-foreground text-xs uppercase">{label}</span>
				<CopyButton content={children} />
			</div>
			<Separator className="my-2" />
			<pre className="text-sm">{children}</pre>
		</div>
	);
}
