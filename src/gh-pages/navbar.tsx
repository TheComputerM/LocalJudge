import { LucideStar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar({ children }: { children: React.ReactNode }) {
	return (
		<nav className="fixed top-0 inset-x-0 z-50 border-b bg-card py-2">
			<div className="container mx-auto px-4 flex items-center justify-between">
				<Button
					render={
						<a
							href="https://github.com/TheComputerM/localjudge/stargazers"
							target="_blank"
						/>
					}
				>
					<LucideStar />
					Star
				</Button>
				{children}
			</div>
		</nav>
	);
}
