// import { ChatOpenAI } from '@langchain/openai'
// import { eq } from 'drizzle-orm'
// // import type { HumanMessage } from 'langchain'
// import { HumanMessage, AIMessage } from "langchain";
// import type { BaseMessage } from '@langchain/core/messages'
export {};
// import { db } from '@/db/index'
// import { conversationMessages, conversations } from '@/db/schema'
// import { setAgent } from './llm'
// // async function generateTitle(userMessage: string, aiResponse: string): Promise<string> {
// //   const model = new ChatOpenAI({
// //     modelName: 'openai/gpt-oss-20b',
// //     apiKey: process.env.OPENROUTER_API_KEY,
// //     temperature: 0.7,
// //     maxTokens: 2000,
// //     timeout: 300000,
// //     configuration: {
// //       baseURL: 'https://openrouter.ai/api/v1',
// //     },
// //   })
// //   const res = await model.invoke([
// //     {
// //       role: 'system',
// //       content: 'Generate a french short title (max 6 words) for this conversation. Reply with ONLY the title, nothing else.',
// //     },
// //     { role: 'user', content: `User: ${userMessage}\nAssistant: ${aiResponse.slice(0, 200)}` },
// //   ])
// //   return (res.content as string).trim()
// // }
// // export const runAgent = async (message: HumanMessage, threadId: string): Promise<{ content: string; title: string | null }> => {
// //   const agent = await setAgent()
// //   try {
// //     const existingState = agent.getState({ configurable: { thread_id: threadId } }) as {
// //       values?: { messages?: unknown[] }
// //     }
// //     console.log('[teacher] threadId:', threadId)
// //     console.log('[teacher] existing messages in checkpoint:', existingState?.values?.messages?.length ?? 0)
// //   } catch (e: any) {
// //     console.error('[teacher] getState failed:', e.message)
// //   }
// //   const result = await agent.invoke({
// //     messages: [message],
// //   }, {
// //     configurable: { thread_id: threadId },
// //   }
// //   )
// //   const aiContent = result.messages.at(-1)?.content?.toString() ?? '';
// //   console.log('[teacher] Historique thread after invoke:', result.messages.length)
// //   // Save messages to readable table (onConflictDoNothing guards against race-condition duplicates)
// //   let [convo] = await db.select().from(conversations).where(eq(conversations.threadId, threadId))
// //   if (!convo) {
// //     const inserted = await db
// //       .insert(conversations)
// //       .values({ threadId })
// //       .onConflictDoNothing({ target: conversations.threadId })
// //       .returning()
// //     convo = inserted[0]
// //     // Race condition: another request inserted first, re-select
// //     if (!convo) {
// //       [convo] = await db.select().from(conversations).where(eq(conversations.threadId, threadId))
// //     }
// //   }
// //   else {
// //     await db.insert(conversationMessages).values([
// //       { conversationId: convo.id, role: 'user', content: message.content as string },
// //       { conversationId: convo.id, role: 'assistant', content: aiContent },
// //     ])
// //   }
// //   // Generate title after first exchange (when no title yet)
// //   let title = convo?.title ?? null;
// //   if (!title && convo) {
// //     try {
// //       title = await generateTitle(message.content as string, aiContent)
// //       await db.update(conversations).set({ title }).where(eq(conversations.id, convo.id))
// //       console.log('[teacher] Generated title:', title)
// //     } catch (err: any) {
// //       console.error('[teacher] Title generation failed:', err.message)
// //     }
// //   }
// //   return { content: aiContent, title }
// // }
// interface AgentResult {
//   messages: BaseMessage;
// }
// export const runAgent = async (message: HumanMessage, threadId: string) => {
//   try {
//     console.log('message => ', message)
//     console.log('threadId => ', threadId)
//     const agent = await setAgent()
//     const result = await agent.invoke({
//       messages: [message]
//     }, {
//       configurable: { thread_id: threadId },
//     })
//     console.log('result agent => ', result.messages[0])
//     return result.messages[0];
//   } catch (err) {
//     console.log(err)
//     return [{ text: String(err) }] as any;
//   }
// }
