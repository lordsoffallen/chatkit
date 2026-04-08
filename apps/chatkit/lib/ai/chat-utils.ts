import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import {
  getChatById,
  getMessageById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { convertToUIMessages } from "@/lib/utils";
import type { ChatMessage, Message, VisibilityType } from "@/types/chat";

export type PreparedChatData = {
  uiMessages: ChatMessage[];
  isNewChat: boolean;
};

export async function prepareChatData(
  chatId: string,
  userId: string,
  message: ChatMessage,
  selectedVisibilityType: VisibilityType
): Promise<PreparedChatData> {
  const chat = await getChatById({ id: chatId });
  let messagesFromDb: Message[] = [];
  let isNewChat = false;

  if (chat) {
    if (chat.userId !== userId) {
      throw new ChatSDKError("forbidden:chat");
    }
    messagesFromDb = await getMessagesByChatId({ id: chatId });
  } else {
    isNewChat = true;
    const title = await generateTitleFromUserMessage({ message });

    await saveChat({
      id: chatId,
      userId,
      title,
      visibility: selectedVisibilityType,
    });
  }

  const uiMessages = [...convertToUIMessages(messagesFromDb), message];

  return { uiMessages, isNewChat };
}

export async function saveUserMessage(
  chatId: string,
  message: ChatMessage
): Promise<void> {
  // Check if message already exists (e.g., from regenerate)
  const existingMessage = await getMessageById({ id: message.id });

  if (existingMessage.length === 0) {
    await saveMessages({
      messages: [
        {
          chatId,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });
  }
}
