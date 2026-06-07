import { Hono } from 'hono';
import type { Env } from '@/types/env'
import { requireAuth } from '@/middleware/auth'
import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db';
import { conversationMessages, conversations } from '@/db/schema';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

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

      const user = c.get('user');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      // const allConversations = await db.select().from(conversations).orderBy(desc(conversations.id)).limit(50)

      // const convoIds = allConversations.map((c) => c.id)

      // const allMessages = convoIds.length
      //   ? await db
      //     .select()
      //     .from(conversationMessages)
      //     .where(inArray(conversationMessages.conversationId, convoIds))
      //     .orderBy(conversationMessages.id)
      //   : []

      // const result = allConversations.map((convo) => ({
      //   ...convo,
      //   messages: allMessages.filter((m) => m.conversationId === convo.id),
      // }))

      // return c.json(result, 200)

      // const allConversations = await db
      //   .select()
      //   .from(conversations)
      //   .orderBy(desc(conversations.id))
      //   .limit(50)

      // const convoIds = allConversations.map(c => c.id)

      // const firstMessages = convoIds.length
      //   ? await db
      //     .select()
      //     .from(conversationMessages)
      //     .where(
      //       and(
      //         inArray(conversationMessages.conversationId, convoIds),
      //         sql`${conversationMessages.id} IN (
      //     SELECT MIN(id) FROM ${conversationMessages}
      //     WHERE ${conversationMessages.conversationId} IN ${convoIds}
      //     GROUP BY ${conversationMessages.conversationId}
      //   )`
      //       )
      //     )
      //   : []

      // const messagesByConvo = new Map(firstMessages.map(m => [m.conversationId, m]))
      // const result = allConversations.map(convo => ({
      //   ...convo,
      //   firstMessage: messagesByConvo.get(convo.id) ?? null,
      // }))

      // const threads = await db.select()
      //   .from(conversations)
      //   .where(eq(conversations.userId, user.id))
      //   .orderBy(desc(conversations.id))
      //   .limit(10)

      // const messages = await db
      //   .select({ 
      //     id: conversationMessages.id,
      //     content: conversationMessages.content
      //   })
      //   .from(conversationMessages)
      //   .where(eq(conversationMessages.role, 'user'))

      // const messagesId = messages.map(m => m.id);
      const result = await db
        .select({
          id: conversations.id,
          threadId: conversations.threadId,
          title: conversations.title,
          createdAt: conversations.createdAt,
          threadFirstContent: conversationMessages.content
        })
        .from(conversations)
        .where(
          and(
            eq(conversations.userId, user.id),
            eq(conversationMessages.role, 'user')
          )
        )
        .fullJoin(conversationMessages, eq(conversations.id, conversationMessages.conversationId))
        .orderBy(desc(conversations.id))
        .limit(10)

      return c.json(result, 200);

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