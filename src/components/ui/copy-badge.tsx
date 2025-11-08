import { LucideCheck, LucideCopy } from "lucide-react";
import { ComponentProps } from "react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Badge } from "./badge";

interface CopyBadgeProps extends ComponentProps<typeof Badge> {
	children: string;
}

export function CopyBadge({ children, ...props }: CopyBadgeProps) {
	const [copy, isCopied] = useCopyToClipboard();
	return (
		<Badge {...props} render={<button />} onClick={() => copy(children)}>
			{isCopied ? <LucideCheck /> : <LucideCopy />}
			{children}
		</Badge>
	);
}
