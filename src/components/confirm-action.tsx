import { AlertDialog as AlertDialogPrimitive } from "@base-ui-components/react/alert-dialog";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { toastManager } from "./ui/toast";

export function ConfirmActionDialog({
	onConfirm,
	trigger,
	nativeButton,
}: {
	onConfirm?: () => void;
	trigger: AlertDialogPrimitive.Trigger.Props["render"];
	nativeButton?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger nativeButton={nativeButton} render={trigger} />
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogClose render={<Button variant="ghost" />}>
						Cancel
					</AlertDialogClose>
					<Button
						variant="destructive"
						disabled={loading}
						onClick={async () => {
							setLoading(true);
							try {
								await onConfirm?.();
								setLoading(false);
								setOpen(false);
							} catch (e) {
								toastManager.add({
									title: "Uh oh! Something went wrong",
									description: JSON.stringify(e),
									type: "error",
								});
							}
						}}
					>
						{loading && <Spinner />}
						Confirm
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
