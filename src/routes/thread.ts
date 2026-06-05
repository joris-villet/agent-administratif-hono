import { Hono } from 'hono';
import type { Env } from '@/types/env'
import { requireAuth } from '@/middleware/auth'
import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db';
import { conversationMessages, conversations } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

const app = new Hono<Env>();

const schemaRename = z.object({
  title: z.string().min(1),
  threadId: z.string(),
});

const schemaDelete = z.object({
  threadId: z.string(),
});


app
  .use('*', requireAuth)
  .get("/get", async (c) => {

    try {

      const allConversations = await db.select().from(conversations).orderBy(desc(conversations.id)).limit(50)

      const convoIds = allConversations.map((c) => c.id)

      const allMessages = convoIds.length
        ? await db
          .select()
          .from(conversationMessages)
          .where(inArray(conversationMessages.conversationId, convoIds))
          .orderBy(conversationMessages.id)
        : []

      const result = allConversations.map((convo) => ({
        ...convo,
        messages: allMessages.filter((m) => m.conversationId === convo.id),
      }))

      return c.json(result, 200)

    } catch (error) {
      console.error('ERREUR agentHandler =>', error)
      return c.json({ message: String(error) }, 500)
    }
  })
  .post('/rename', zValidator('json', schemaRename), async (c) => {
    try {

      const body = c.req.valid('json')
      //console.log('body => ', body)

      const { title, threadId } = body;

      const data = await db
        .update(conversations)
        .set({ title: title })
        .where(eq(conversations.threadId, threadId))

      if (data.rowCount === 0) {
        return c.json({
          error: 'Conversation non trouvée'
        }, 404)
      }

      return c.json({
        success: true,
        message: 'Conversation mise à jour',
      }, 200);

    } catch (error) {
      console.error('ERREUR agentHandler =>', error)
      return c.json({ message: String(error) }, 500)
    }
  })
  .delete('/delete', zValidator('json', schemaDelete), async (c) => {
    try {

      const body = c.req.valid('json');
      console.log('body => ', body);

      const { threadId } = body;

      const data = await db
        .delete(conversations)
        .where(eq(conversations.threadId, threadId));

      if (data.rowCount === 0) {
        return c.json({ error: 'Conversation non trouvée' }, 404)
      }
      return c.json({ success: true })
    } catch (err) {
      console.error('ERREUR delete thread =>', err)
      return c.json({ message: String(err) }, 500)
    }
  })

export default app