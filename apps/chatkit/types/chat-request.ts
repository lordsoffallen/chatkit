import { z } from "zod";
import { visibilityTypeEnum } from "@/lib/db/schema";

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.enum(["image/jpeg", "image/png"]),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

const userMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["user"]),
  parts: z.array(partSchema),
});

// Permissive schema for tool approval continuation flows
const anyMessageSchema = z.object({
  id: z.string(),
  role: z.string(),
  parts: z.array(z.any()),
});

export const chatRequestSchema = z.object({
  id: z.string().uuid(),
  message: userMessageSchema.optional(),
  messages: z.array(anyMessageSchema).optional(),
  selectedChatModel: z.string().min(1),
  selectedVisibilityType: z.enum([...visibilityTypeEnum.enumValues]),
  selectedToolGroups: z.array(z.string()).default([]),
});

export type ChatRequestBody = z.infer<typeof chatRequestSchema>;
