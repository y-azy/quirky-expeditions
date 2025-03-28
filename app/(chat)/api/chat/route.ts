import { convertToCoreMessages, Message, streamText } from "ai";

// Internal imports should be grouped and ordered by path depth
import { model as openAIModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { deleteChatById, getChatById } from "@/db/queries";
import { allTools } from "@/lib/tools";
import { saveChatMessages } from "@/lib/tools/chat-helpers";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: openAIModel,
    system: `AI travel agent using Amadeus API. Help with flights, bookings & travel tips. Current: ${new Date().toLocaleDateString()}.`,
    messages: coreMessages,
    tools: allTools,
    onFinish: async (responseMessages) => {
      if (session.user) {
        await saveChatMessages(id, coreMessages, responseMessages, session.user);
      }
    },
    experimental_telemetry: {
      isEnabled: true,
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting chat:", error);
    
    return new Response("An error occurred while processing your request", {
      status: 500 },
    );
  }
}