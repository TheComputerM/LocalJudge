import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../ui/toast";
import { ThemeProvider } from "./theme";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<ToastProvider position="top-right" timeout={3000}>
					{children}
				</ToastProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
