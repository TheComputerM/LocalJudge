import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

export function BufferTextBlock({
	className,
	label,
	children,
	...props
}: React.HTMLProps<HTMLDivElement>) {
	return (
		<div className={cn("bg-muted p-3 rounded-md", className)} {...props}>
			<div className="flex justify-between items-center">
				<span className="text-muted-foreground text-xs uppercase">{label}</span>
			</div>
			<Separator className="my-2" />
			<pre className="text-sm">{children}</pre>
		</div>
	);
}
