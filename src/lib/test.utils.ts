import env from "@/lib//env";
import { auth } from "@/lib/auth";

export namespace TestUtils {
	if (process.env.NODE_ENV !== "test")
		throw new Error("TestUtils can only be used in test environment");

	export async function getAdminCookie(): Promise<string> {
		const { headers } = await auth.api.signInEmail({
			body: {
				email: env.ADMIN_EMAIL,
				password: env.ADMIN_PASSWORD,
			},
			returnHeaders: true,
		});
		return headers.getSetCookie()[0];
	}

	export async function createTestUser() {
		const email = `testuser_${Date.now()}@localjudge.test`;
		const password = "TestPassword123";
		const { user } = await auth.api.createUser({
			body: {
				name: "Test User",
				email: email,
				password: password,
				role: "user",
			},
		});
		const { headers } = await auth.api.signInEmail({
			body: {
				email: email,
				password: password,
			},
			returnHeaders: true,
		});
		const cookie = headers.getSetCookie()[0];
		return { data: user, cookie };
	}
}
