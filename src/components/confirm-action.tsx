import { LucideLoader2 } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

export function ConfirmActionDialog({
	children,
	onConfirm,
}: {
	children: React.ReactNode;
	onConfirm?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button
						disabled={loading}
						onClick={async () => {
							setLoading(true);
							await onConfirm?.();
							setLoading(false);
							setOpen(false);
						}}
					>
						{loading && <LucideLoader2 className="animate-spin" />}
						Confirm
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
