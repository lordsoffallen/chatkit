import { geolocation } from "@vercel/functions";
import { createUIMessageStreamResponse } from "ai";
import { headers } from "next/headers";
import { prepareChatData, saveUserMessage } from "@/lib/ai/chat-utils";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import type { RequestHints } from "@/lib/ai/prompts";
import { createChatStream } from "@/lib/ai/stream-execution";
import { auth } from "@/lib/auth";
import {
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { normalizeSession } from "@/lib/utils";
import type { ToolGroupId } from "@/artifacts/tools/meta";
import type { ChatMessage, VisibilityType } from "@/types/chat";
import { type ChatRequestBody, chatRequestSchema } from "@/types/chat-request";

export const maxDuration = 60;

export async function POST(request: Request) {
  let requestBody: ChatRequestBody;

  try {
    const json = await request.json();
    requestBody = chatRequestSchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message, messages, selectedChatModel, selectedVisibilityType, selectedToolGroups } =
      requestBody;

    const isToolApprovalFlow = Boolean(messages);

    // Validate model exists
    const { providers } = await import("@/lib/ai/models");
    if (!providers.exists(selectedChatModel)) {
      return new ChatSDKError("bad_request:api").toResponse();
    }

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (
      messageCount >
      entitlementsByUserType[
        session.user.role as keyof typeof entitlementsByUserType
      ].maxMessagesPerDay
    ) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    let uiMessages: ChatMessage[];
    let originalMessageIds: Set<string> | undefined;

    if (isToolApprovalFlow) {
      const chat = await getChatById({ id });
      if (!chat) return new ChatSDKError("not_found:chat").toResponse();
      if (chat.userId !== session.user.id)
        return new ChatSDKError("forbidden:chat").toResponse();
      uiMessages = messages as ChatMessage[];
      originalMessageIds = new Set(uiMessages.map((m) => m.id));
    } else {
      const { uiMessages: prepared } = await prepareChatData(
        id,
        session.user.id,
        message as ChatMessage,
        selectedVisibilityType as VisibilityType
      );
      uiMessages = prepared;
      await saveUserMessage(id, message as ChatMessage);
    }

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    const { stream } = await createChatStream({
      chatId: id,
      uiMessages,
      selectedChatModel,
      requestHints,
      session: normalizeSession(session.session),
      originalMessageIds,
      selectedToolGroups: selectedToolGroups as ToolGroupId[],
    });

    // const streamContext = getStreamContext();

    // if (streamContext) {
    //   return new Response(
    //     await streamContext.resumableStream(streamId, () =>
    //       stream.pipeThrough(new JsonToSseTransformStream())
    //     )
    //   );
    // }

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Check for Vercel AI Gateway credit card error
    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
