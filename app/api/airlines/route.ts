import { getAirlineDetails } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Missing airline code", { status: 400 });
  }

  try {
    const airline = await getAirlineDetails(code);
    return Response.json(airline);
  } catch (error) {
    console.error("Error fetching airline details:", error);
    return new Response("Failed to fetch airline details", { status: 500 });
  }
}
