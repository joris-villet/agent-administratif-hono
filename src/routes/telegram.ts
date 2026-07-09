import { Hono } from "hono";
import type { Env } from "@/types/env";
import { sendMessage } from "@/utils/telegram/sendMessage";
import { setAgent } from "@/agent/telegram.llm";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { HumanMessage } from "langchain";

const schemaTelegram = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      is_bot: z.boolean(),
      first_name: z.string(),
      language_code: z.string(),
    }),
    chat: z.object({
      id: z.number(),
      first_name: z.string(),
      type: z.string(),
    }),
    date: z.number(),
    text: z.string(),
    document: z
      .object({
        file_name: z.string(),
        mime_type: z.string(),
        file_id: z.string(),
        file_unique_id: z.string(),
        file_size: z.number(),
      })
      .optional(),
    caption: z.string().optional(),
    voice: z
      .object({
        duration: z.number(),
        mime_type: z.string(),
        file_id: z.string(),
        file_unique_id: z.string(),
        file_size: z.number(),
      })
      .optional(),
    video_note: z
      .object({
        duration: z.number(),
        length: z.number(),
        thumbnail: z.any(), // correspond à [Object]
        thumb: z.any(), // correspond à [Object]
        file_id: z.string(),
        file_unique_id: z.string(),
        file_size: z.number(),
      })
      .optional(),
    photo: z.array(z.any()).optional(), // correspond à Photo[]
  }),
});

const app = new Hono<Env>();

// app.post("/message", zValidator("json", schemaTelegram), async (c) => {
//   try {
//     console.log("req json", c.req.json());
//     const body = c.req.valid("json");
//     const headers = c.req.header();
//     // console.log("headers => ", headers);

//     const telegramBotApiToken: string | undefined = headers[
//       "x-telegram-bot-api-secret-token"
//     ] as string;

//     if (process.env.TELEGRAM_SECRET !== telegramBotApiToken) {
//       return c.json("No authorized", 400);
//     }

//     console.log("body telegram => ", body);

//     const userMessage = body.message.text;
//     const chatId = process.env.TELEGRAM_CHAT_ID;
//     console.log("user message => ", userMessage);

//     const agent = setAgent();
//     const humanMessage = new HumanMessage({ content: body.message.text });

//     const responseAgent = (await agent).invoke(
//       { messages: humanMessage },
//       { configurable: { thread_id: body.message.chat.id } }
//     );

//     const aiMessage = (await responseAgent).messages.at(-1)?.content;
//     console.log("messages length  => ", (await responseAgent).messages.length);
//     console.log("messages => ", (await responseAgent).messages);

//     if (aiMessage) {
//       await sendMessage(chatId, aiMessage);
//     }

//     return c.json("ok", 200);
//   } catch (err) {
//     return c.json(err);
//   }
// })
app.get("/message", async (c) => {
  return c.json("ok", 200);
})

app.post("/message", zValidator("json", schemaTelegram), async (c) => {
  try {
    // const body = await c.req.json();
    const body = c.req.valid("json");
    console.log("body validator => ", body);
    const headers = c.req.header();
    // console.log("headers => ", headers);

    const telegramBotApiToken: string | undefined = headers[
      "x-telegram-bot-api-secret-token"
    ] as string;

    if (process.env.TELEGRAM_SECRET !== telegramBotApiToken) {
      return c.json("No authorized", 400);
    }

    // console.log("body telegram => ", body);

    const userMessage = body.message.text;
    const chatId = process.env.TELEGRAM_CHAT_ID!;
    console.log("user message => ", userMessage);

    const agent = setAgent();
    const humanMessage = new HumanMessage({ content: body.message.text });

    const responseAgent = (await agent).invoke(
      { messages: humanMessage },
      { configurable: { thread_id: body.message.chat.id } }
    );

    const aiMessage = (await responseAgent).messages.at(-1)?.content;
    console.log("messages length  => ", (await responseAgent).messages.length);
    console.log("messages => ", (await responseAgent).messages);

    if (aiMessage) {
      await sendMessage(chatId, aiMessage);
    }

    return c.json("ok", 200);
  } catch (err) {
    return c.json(err);
  }
});

export default app;
