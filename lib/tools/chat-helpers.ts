import { CoreMessage, Message } from "ai";
import { User } from "next-auth";
import { saveChat } from "@/db/queries";

export async function saveChatMessages(
  id: string,
  coreMessages: CoreMessage[],
  responseMessages: any,
  user: User
) {
  if (!user || !user.id) {
    console.warn("No user ID to save chat");
    return;
  }

  try {
    // Check if responseMessages is iterable
    if (responseMessages && Symbol.iterator in Object(responseMessages)) {
      await saveChat({
        id,
        messages: [...coreMessages, ...responseMessages],
        userId: user.id,
      });
    } else {
      // Handle case where responseMessages is not iterable
      console.log("responseMessages is not iterable, saving only core messages");
      await saveChat({
        id,
        messages: coreMessages,
        userId: user.id,
      });
    }
  } catch (error) {
    console.error("Failed to save chat:", error);
  }
}
