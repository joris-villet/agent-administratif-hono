import { HumanMessage } from '@langchain/core/messages'
import { randomUUID } from 'crypto'
import { Hono } from 'hono';
import type { Env } from '@/types/env'
import { requireAuth } from '@/middleware/auth'
import { runAgent } from '@/agent/runAgent'
import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<Env>();

const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1),
    })
  ).min(1),
  threadId: z.string().nullish(),
})
app
  .use('*', requireAuth)
  .post("/message", zValidator('json', messageSchema), async (c) => {

    try {
      const body = c.req.valid('json')
      console.log('body => ', body)

      const { messages, threadId: clientThreadId } = body;
      const threadId = clientThreadId || randomUUID();

      console.log(
        '[teacherHandler] clientThreadId:',
        clientThreadId ?? 'MISSING (new UUID generated)',
        '| threadId:',
        threadId
      )

      const content = messages?.at(-1)?.content;

      if (!content) {
        return c.json({ message: 'Missing message content' }, 500)
      }

      const message = new HumanMessage({ content })
      const { content: aiContent, title } = await runAgent(message, threadId)

      console.log('response agent => ', { content: aiContent, title })

      return c.json({ content: aiContent, threadId, title }, 200)

    } catch (error) {
      console.error('ERREUR agentHandler =>', error)
      return c.json({ message: String(error) }, 500)
    }
  });

export default app