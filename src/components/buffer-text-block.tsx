import { LucideCheck, LucideCopy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

function CopyButton({ content }: { content: string }) {
	const [copy, isCopied] = useCopyToClipboard();
	return (
		<Button size="icon-sm" variant="ghost" onClick={() => copy(content)}>
			{isCopied ? (
				<LucideCheck className="size-3" />
			) : (
				<LucideCopy className="size-3" />
			)}
		</Button>
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
		<div className={cn("bg-muted/75 rounded-md", className)}>
			<div className="flex justify-between items-center px-4 py-1 border-b border-border">
				<span className="text-muted-foreground text-xs uppercase">{label}</span>
				<CopyButton content={children} />
			</div>
			<pre className="text-sm px-4 py-3">{children}</pre>
		</div>
	);
}
