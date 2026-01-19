import { authOptions } from "./config";
import { headers } from "next/headers";

// For NextAuth v5, we need to get session from the request
// This is a workaround until we can properly use the auth() function
export async function getServerSession() {
  try {
    // In NextAuth v5, we can use the auth() function from next-auth
    // But it requires being called in a server component context
    const { auth } = await import("next-auth");
    const headersList = await headers();
    const session = await auth();
    return session;
  } catch (error) {
    // Fallback - return null if we can't get session
    console.error("Failed to get session:", error);
    return null;
  }
}
