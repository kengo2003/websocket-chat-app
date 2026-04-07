import { z } from "zod";

export const ChatSchema = z.object({
  type: z.literal("chat"),
  user: z.string().trim().min(1).max(32),
  text: z.string().trim().min(1).max(200),
  ts: z.number().int(),
});

export type ChatMessage = z.infer<typeof ChatSchema>;
