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
    // Ensure responseMessages is an array and handle various possible formats
    let messagesToSave = [...coreMessages];
    
    if (responseMessages) {
      // Check if responseMessages is a single message object
      if (responseMessages.id && responseMessages.role && responseMessages.content) {
        messagesToSave.push(responseMessages);
      } 
      // Check if it's an array or array-like object
      else if (Array.isArray(responseMessages) || 
               (typeof responseMessages === 'object' && responseMessages[Symbol.iterator])) {
        try {
          messagesToSave = [...messagesToSave, ...responseMessages];
        } catch (error) {
          console.error("Error converting responseMessages to array:", error);
        }
      } else {
        console.warn("responseMessages is not in expected format:", responseMessages);
      }
    }
    
    await saveChat({
      id,
      messages: messagesToSave,
      userId: user.id,
    });
  } catch (error) {
    console.error("Failed to save chat:", error);
  }
}
