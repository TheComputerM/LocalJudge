import { Type } from "@sinclair/typebox";

export namespace LocalboxSchema {
	export const File = Type.Object({
		content: Type.String({
			description: "Content of the file",
			examples: ["Hello World"],
		}),
		encoding: Type.Optional(
			Type.Union(
				[Type.Literal("utf8"), Type.Literal("base64"), Type.Literal("hex")],
				{ default: "utf8", description: "Encoding of the content field" },
			),
		),
		name: Type.String({
			description: "Path of the file within the sandbox",
			examples: ["hello.txt"],
		}),
	});

	export const EngineInfo = Type.Object({
		installed: Type.Boolean({
			description: "Whether the packages used by the engine are installed",
			examples: [false],
		}),
		run_file: Type.String({
			description: "Name of main file that is executed by the engine h",
			examples: ["main.py"],
		}),
		version: Type.String({
			description: "Version of the runtime or compiler used by the engine",
			examples: ["3.12.11"],
		}),
	});

	export const Result = Type.Object({
		exit_code: Type.Number({
			description: "Exit code/signal from the program",
			examples: [0],
		}),
		max_rss: Type.Number({
			description: "Maximum resident set size of the program in KB",
			examples: [128],
		}),
		memory: Type.Number({
			description: "Total memory use by the whole control group in KB",
			examples: [256],
		}),
		message: Type.String({
			description: "Human-readable message",
			examples: ["Executed"],
		}),
		status: Type.Enum(
			{
				OK: "OK",
				RE: "RE",
				SG: "SG",
				TO: "TO",
				XX: "XX",
				OE: "OE",
				CE: "CE",
			},
			{
				description: "Two-letter status code",
			},
		),
		stderr: Type.String({
			description: "stderr of the program",
			examples: [""],
		}),
		stdout: Type.String({
			description: "stdout of the program",
			examples: ["program output"],
		}),
		time: Type.Number({
			description: "Run time of the program in milliseconds",
			examples: [500],
		}),
		wall_time: Type.Number({
			description: "Wall time of the program in milliseconds",
			examples: [1000],
		}),
	});

	export const PhaseOptions = Type.Partial(
		Type.Object({
			buffer_limit: Type.Number({
				description: "Maximum kilobytes to capture from stdout and stderr",
			}),
			environment: Type.Record(Type.String(), Type.String()),
			file_size_limit: Type.Number({
				description:
					"Maximum size a file created/modified in the sandbox in KB, -1 for no limit",
			}),
			files_limit: Type.Number({
				description:
					"Maximum number of open files allowed in the sandbox, '-1' for no limit",
			}),
			memory_limit: Type.Number({
				description:
					"Maximum total memory usage allowed by the whole control group in KB, '-1' for no limit",
			}),
			network: Type.Boolean({
				description: "Whether to enable network access in the sandbox",
			}),
			process_limit: Type.Number({
				description: "Maximum number of processes allowed in the sandbox",
			}),
			stdin: Type.String({
				description: "Text to pass into stdin of the program",
			}),
			time_limit: Type.Number({
				description:
					"Maximum CPU time of the program in milliseconds, '-1' for no limit",
			}),
			wall_time_limit: Type.Number({
				description:
					"Maximum wall time of the program in milliseconds, '-1' for no limit",
			}),
		}),
	);
}
