import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function getServerSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}
