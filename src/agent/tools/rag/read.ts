// import { db } from '@/db/index'
// import { documents } from '@/db/schema'

// export const readRAG = async () => {
//   try {
//     const documentsList = await db.select().from(documents).limit(20)
//     return documentsList.map((d: any) => `id: ${d.id} | titre: ${d.title}`).join('\n')
//   } catch (error) {
//     console.log('error readRAG => ', error)
//     return `❌ ${error}`
//   }
// }
