import {
	LucideBlocks,
	LucideCheck,
	LucideCircleDashed,
	LucideCloudCog,
	LucideCode,
	LucideExternalLink,
	LucideFolderGit2,
	LucideGauge,
	LucideHistory,
	LucideServer,
	LucideUserLock,
	LucideWind,
} from "lucide-react";
import { Fragment } from "react";
import { BufferTextBlock } from "@/components/buffer-text-block";
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

function Features() {
	return (
		<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
			<Card className="sm:col-span-2 min-w-0">
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
				<CardPanel>
					<BufferTextBlock label="shell">
						{[
							"git clone https://github.com/TheComputerM/localjudge",
							"docker compose up -d",
						].join("\n")}
					</BufferTextBlock>
				</CardPanel>
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
								href="https://github.com/TheComputerM/localjudge"
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
			{/*<Card>
				<CardHeader>
					<CardTitle>Minimal and Fast</CardTitle>
					<CardDescription>
						LocalJudge is built from the ground up to be fast and efficient. It
						uses{" "}
						<a href="https://bun.com/" className="text-foreground underline">
							Bun
						</a>{" "}
						for its javascript runtime, which allows it to use technologies like{" "}
						<a
							href="https://bun.com/docs/runtime/workers"
							className="text-foreground underline"
						>
							Workers
						</a>{" "}
						to perform heavy tasks on separate threads.
					</CardDescription>
					<CardAction>
						<LucideGauge />
					</CardAction>
				</CardHeader>
			</Card>
			<Card className="sm:col-span-2">
				<CardHeader>
					<CardTitle>Modern Technologies</CardTitle>
					<CardDescription>
						LocalJudge leverages modern web technologies and tools such as React
						19, Tanstack Start, ShadCN UI, COSS UI and Monaco Editor (the same
						editor powering VSCode) to provide a sleek and responsive user
						interface.
					</CardDescription>
					<CardAction>
						<LucideWind />
					</CardAction>
				</CardHeader>
				<CardFooter className="justify-stretch gap-3 flex-wrap">
					<Button
						className="grow"
						render={
							<a
								href="https://github.com/microsoft/monaco-editor"
								target="_blank"
							/>
						}
					>
						<LucideExternalLink />
						Monaco Editor
					</Button>

					<Button
						className="grow"
						render={<a href="https://tanstack.com/start" target="_blank" />}
					>
						<LucideExternalLink /> TanStack Start
					</Button>
					<Button
						className="grow"
						render={<a href="https://ui.shadcn.com/" target="_blank" />}
					>
						<LucideExternalLink />
						ShadCN UI
					</Button>
				</CardFooter>
			</Card>*/}
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
				<div className="container mx-auto px-4 flex items-center justify-between">
					<span className="text-sm text-muted-foreground">
						Made by{" "}
						<a
							href="https://thecomputerm.dev"
							className="font-medium text-foreground hover:underline"
						>
							TheComputerM
						</a>
					</span>
					{new Date().getFullYear()}
				</div>
			</footer>
		</Fragment>
	);
}
