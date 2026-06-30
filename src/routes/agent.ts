import { HumanMessage, AIMessage } from 'langchain'
import { randomUUID } from 'crypto'
import { Hono } from 'hono';
import type { Env } from '@/types/env'
import { requireAuth } from '@/middleware/auth'
// import { runAgent } from '@/agent/runAgent'
import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';
import { setAgent } from '@/agent/llm'
import { db } from '@/db';
import { conversationMessages, conversations } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateTitle } from '@/utils/generateTitle';

const app = new Hono<Env>();

const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1),
    })
  ).min(1),
  threadId: z.string(),
});


const generateTitleSchema = z.object({
  threadId: z.string()
})

app
  .use('*', requireAuth)
  .post("/message", zValidator('json', messageSchema), async (c) => {

    try {
      const user = c.get('user');
      const body = c.req.valid('json');
      //console.log('body => ', body);

      console.log("user logged => ", user?.id)

      const content = body.messages.at(-1)?.content;

      if (!content) {
        return c.json({ message: 'Missing message content' }, 400)
      }

      const humanMessage = new HumanMessage({ content });
      const agent = await setAgent();

      const responseAgent = await agent.invoke({
        messages: [humanMessage]
      }, {
        configurable: { thread_id: body.threadId },
      });

      const lastMessage = responseAgent.messages.at(-1)

      if (lastMessage instanceof AIMessage) {
        // const usage = lastMessage?.usage_metadata

        const aiContent = lastMessage.text
        const usage = lastMessage.usage_metadata

        console.log('response agent => ', aiContent)
        console.log('usage =>', usage)

        if (!user) {
          return c.json({ error: 'Unauthorized' }, 401)
        }

        const [conversationSaved] = await db
          .insert(conversations)
          .values({
            threadId: body.threadId,
            userId: user.id
          })
          .onConflictDoNothing({ target: conversations.threadId })
          .returning({ id: conversations.id })


        if (conversationSaved) {
          await db.insert(conversationMessages).values([
            { conversationId: conversationSaved.id, role: 'user', content: humanMessage.text },
            { conversationId: conversationSaved.id, role: 'assistant', content: aiContent },
          ]);
        }

        return c.json({ content: aiContent, threadId: body.threadId, usage }, 200);
      }


      return c.json('No message AI', 500)


    } catch (error) {
      console.error('ERREUR agentHandler =>', error)
      return c.json({ message: String(error) }, 500)
    }
  })
  .post("/generate-title", zValidator('json', generateTitleSchema), async (c) => {
    try {
      const user = c.get('user');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const body = c.req.valid('json');

      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.threadId, body.threadId),
            eq(conversations.userId, user.id)
          )
        )

      //console.log('conversation => ', conversation)

      if (!conversation) {
        return c.json('No conversation found', 403)
      }

      if (conversation.title !== null) {
        return c.json({ title: conversation.title }, 200)
      }

      const messages = await db
        .select({
          role: conversationMessages.role,
          content: conversationMessages.content
        })
        .from(conversationMessages)
        .where(eq(conversationMessages.conversationId, conversation.id))
        .orderBy(conversationMessages.id)
        .limit(2)

      //console.log('messages => ', messages)

      if (messages.length === 0) {
        return c.json('Nouvelle conversation', 200)
      }

      const titleThread = await generateTitle(messages);

      console.log("titleThread => ", titleThread)

      if (titleThread) {
        await db
          .update(conversations)
          .set({ title: titleThread })
          .where(eq(conversations.id, conversation.id))

        console.log('titleThread => ', titleThread)
      }

      return c.json({ title: titleThread }, 200)
      //return c.json('ok', 200)


    } catch (error) {
      console.error('ERREUR agentHandler =>', error)
      return c.json({ message: String(error) }, 500)
    }
  })

export default app