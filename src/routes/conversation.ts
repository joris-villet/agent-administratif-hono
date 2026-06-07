import { Hono } from 'hono';
import type { Env } from '@/types/env'
import { requireAuth } from '@/middleware/auth'
import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db';
import { conversationMessages, conversations } from '@/db/schema';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

const app = new Hono<Env>();

const conversationSchema = z.object({
  conversationId: z.number()
});

app
  .use('*', requireAuth)
  .post("/get", zValidator('json', conversationSchema), async (c) => {
    try {

      const user = c.get('user');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const body = c.req.valid('json');

      console.log("body validator => ", body)

      const result = await db
        .select({ role: conversationMessages.role, content: conversationMessages.content })
        .from(conversationMessages)
        .fullJoin(conversations, eq(conversationMessages.conversationId, conversations.id))
        .where(
          and(
            eq(conversationMessages.conversationId, body.conversationId),
            eq(conversations.userId, user.id)
          )
        )

      // const conversations = await db
      //   .select()
      //   .from(conversationMessages)
      //   .where(eq(conversationMessages.conversationId, body.conversationId))

      return c.json(result, 200)

    } catch (error) {
      console.error('ERREUR agentHandler =>', error)
      return c.json({ message: String(error) }, 500)
    }
  })

export default app;