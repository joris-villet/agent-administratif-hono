import { Hono } from "hono";
import type { Env } from "@/types/env";
import { sendMessage } from "@/utils/telegram/sendMessage";
import { setAgent } from "@/agent/telegram.llm";
// import * as z from "zod";
// import { zValidator } from "@hono/zod-validator";
import { HumanMessage } from "langchain";
import type { FileInfo } from '@/interfaces/telegram'
import ky from 'ky'

const app = new Hono<Env>();

app.post("/message", async (c) => {
  try {
    // const body = await c.req.json();
    const body = await c.req.json();
    console.log("body => ", body);
    const headers = c.req.header();
    // console.log("headers => ", headers);

    const telegramBotApiToken: string | undefined = headers[
      "x-telegram-bot-api-secret-token"
    ] as string;

    if (process.env.TELEGRAM_SECRET !== telegramBotApiToken) {
      return c.json("No authorized", 400);
    }

    // console.log("body telegram => ", body);

    let message: HumanMessage
    const tokenTelegram = process.env.TELEGRAM_BOT_TOKEN as string
    const userMessage = body.message.text || ''
    const photoTelegram = body.message.photo;
    const chatId = process.env.TELEGRAM_CHAT_ID!;
    console.log("user message => ", userMessage);

    const agent = setAgent();


    if (photoTelegram) {
      // console.log("✅ entrée dans photo");
      // console.log('dernier file_id =>', photoTelegram.at(-1)?.file_id);

      try {

      const fileInfo = await ky
        .get(
          `https://api.telegram.org/bot${tokenTelegram}/getFile?file_id=${photoTelegram.at(-1)?.file_id}`
        )
        .json<FileInfo>()

        //console.log("fileInfo =>", fileInfo);

      const filePath = fileInfo.result.file_path
      const fileBuffer = await ky
        .get(`https://api.telegram.org/file/bot${tokenTelegram}/${filePath}`)
        .arrayBuffer()

        //console.log("fileBuffer =>", fileBuffer);

      const base64 = Buffer.from(fileBuffer).toString('base64')

      // console.log("base64 =>", base64);

      message = new HumanMessage({
        content: [
          {
            type: 'text',
            text:
              body.message.caption ||
              'Scan ce ticket de caisse et ajoute le montant TTC et le magasin dans mon tableur de courses',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
        ],
      })



        const responseAgent = await (await agent).invoke(

            { messages: message },

            { configurable: { thread_id: chatId } }

          );

          const aiMessage = responseAgent.messages.at(-1)?.content;

          console.log("réponse agent photo =>", aiMessage);

          if (aiMessage) await sendMessage(chatId, aiMessage);
          return;

      } catch (err) {

        console.error("agent photo crashed:", err);

        await sendMessage(chatId, "⚠️ agent crashed sur la photo");
        return;

      }
    }


    const humanMessage = new HumanMessage({ content: body.message.text });

    const responseAgent = (await agent).invoke(
      { messages: humanMessage },
      { configurable: { thread_id: chatId } }
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
