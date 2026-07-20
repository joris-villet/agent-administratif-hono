// import { eq } from 'drizzle-orm'
// import { db } from '@/db/index'
// import { chunks, documents } from '@/db/schema'
export {};
// export const deleteChunks = async ({ documentId }: { documentId: number }) => {
//   try {
//     const result = await db.delete(chunks).where(eq(chunks.documentId, documentId))
//     return result
//   } catch (error) {
//     console.log('❌ error deleteChunks => ', error)
//     throw error
//   }
// }
// export const deleteRAG = async ({ id }: { id: number }) => {
//   try {
//     await deleteChunks({ documentId: id })
//     await db.delete(documents).where(eq(documents.id, id))
//     return `✅ Document ${id} supprimé`
//   } catch (error) {
//     console.log('❌ error deleteRAG => ', error)
//     return `❌ ${error}`
//   }
// }
