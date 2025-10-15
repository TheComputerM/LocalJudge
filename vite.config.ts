import tailwindcss from "@tailwindcss/vite";
// need to remove when nitro v3 is out of beta
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tsConfigPaths(),
		tailwindcss(),
		tanstackStart(),
		nitroV2Plugin({ preset: "bun" }),
		react(),
	],
});
