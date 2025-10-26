import { useRouter } from "@tanstack/react-router";
import { LucideLogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "./ui/button";

/**
 * A button component that signs the user out.
 */
export function SignOutButton() {
	const router = useRouter();
	async function signOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.invalidate();
				},
			},
		});
	}

	return (
		<Button variant="secondary" onClick={signOut}>
			Sign Out
			<LucideLogOut />
		</Button>
	);
}
