import {
	LucideBlocks,
	LucideCheck,
	LucideCircleDashed,
	LucideCloudCog,
	LucideCode,
	LucideExternalLink,
	LucideFolderGit2,
	LucideHistory,
	LucideServer,
	LucideUserLock,
} from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardPanel,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function Features() {
	return (
		<div className="grid grid-cols-3 gap-6">
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle>Easy to Self-Host</CardTitle>
					<CardDescription>
						Deploy LocalJudge on your own server with just a single docker
						compose file. No need for any fancy AWS setups or cloud
						configurations, just a 3 docker containers are enough!
					</CardDescription>
					<CardAction>
						<LucideServer />
					</CardAction>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Fully Open-Source</CardTitle>
					<CardDescription>
						LocalJudge is completely open-source. You can inspect the code
						yourself, contribute to it, or even modify it to suit your needs.
					</CardDescription>
					<CardAction>
						<LucideFolderGit2 />
					</CardAction>
				</CardHeader>
				<CardFooter>
					<Button
						className="w-full"
						render={
							<a
								href="https://github.com/TheComputerM/LocalJudge"
								target="_blank"
							/>
						}
					>
						<LucideCode />
						View Source
					</Button>
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>BYO Social Sign-On</CardTitle>
					<CardDescription>
						LocalJudge is powered by better-auth, which allows you to use from
						over 30+ OAuth providers like Google, Github, Microsoft and more for
						your user login and authentication.
					</CardDescription>
					<CardAction>
						<LucideUserLock />
					</CardAction>
				</CardHeader>
				<CardFooter>
					<Button
						className="w-full"
						render={
							<a
								href="https://www.better-auth.com/docs/authentication/apple"
								target="_blank"
							/>
						}
					>
						<LucideBlocks />
						Avilable Providers
					</Button>
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Any Language</CardTitle>
					<CardDescription>
						LocalJudge uses Localbox to run user code in isolated sandboxes. You
						can customize them to support any programming language, environment
						or tool you need.
					</CardDescription>
					<CardAction className="flex">
						<LucideCloudCog />
					</CardAction>
				</CardHeader>
				<CardFooter>
					<Button
						className="w-full"
						render={
							<a
								href="https://github.com/thecomputerm/localbox"
								target="_blank"
							/>
						}
					>
						<LucideExternalLink />
						See Localbox
					</Button>
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Edit History</CardTitle>
					<CardDescription>
						LocalJudge takes snapshots of the user's code as they type, allowing
						users to restore their code if and the administrators to see the
						complete edit history.
					</CardDescription>
					<CardAction>
						<LucideHistory />
					</CardAction>
				</CardHeader>
				<CardPanel className="flex items-center justify-center">
					<span className="grow border-y" />
					<span className="border border-current p-1 rounded-full text-green-600 dark:text-green-400">
						<LucideCheck className="size-3" />
					</span>
					<span className="grow border-y" />
					<span className="border border-current p-1 rounded-full text-amber-600 dark:text-amber-400">
						<LucideCircleDashed className="size-3" />
					</span>
					<span className="grow border-y" />
				</CardPanel>
			</Card>
		</div>
	);
}

export function HomePage() {
	return (
		<Fragment>
			<div className="container mx-auto">
				<h2 className="text-3xl leading-10 sm:text-4xl md:text-[40px] md:leading-13 font-semibold tracking-tight text-center">
					Everything you Need
				</h2>
				<br />
				<Features />
			</div>
			<br />
			<footer className="mt-12 border-t py-4">
				<div className="container mx-auto flex items-center justify-between">
					<span className="text-sm text-fore">
						Made by
						<Button
							variant="link"
							render={<a href="https://thecomputerm.dev" />}
						>
							TheComputerM
						</Button>
					</span>
					{new Date().getFullYear()}
				</div>
			</footer>
		</Fragment>
	);
}
