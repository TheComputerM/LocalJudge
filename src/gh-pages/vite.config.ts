import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	root: "./src/gh-pages",
	base: "/localjudge",
	plugins: [tsConfigPaths(), tailwindcss(), react()],
	build: {
		emptyOutDir: true,
	},
});
