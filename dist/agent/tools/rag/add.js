// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
// import { Document } from '@langchain/core/documents'
// import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
// import { sql } from 'drizzle-orm'
// import { extractText } from 'unpdf'
// import { db } from '@/db/index'
// import { chunks, documents } from '@/db/schema'
// import { createVectorStore } from '@/utils/vectors/index'
export {};
// const s3 = new S3Client({
//   region: process.env.STORAGE_S3_REGION || 'auto',
//   endpoint: process.env.STORAGE_S3_ENDPOINT,
//   credentials: {
//     accessKeyId: process.env.STORAGE_S3_KEY!,
//     secretAccessKey: process.env.STORAGE_S3_SECRET!,
//   },
//   forcePathStyle: true,
// })
// let _buffer: Buffer | null = null
// let _fileName: string | null = null
// export const setPdfBuffer = (buffer: Buffer, fileName: string) => {
//   _buffer = buffer
//   _fileName = fileName
// }
// // export const addRAG = async () => {
// //   if (!_buffer) return 'Aucun document disponible.'
// //   try {
// //     const uint8 = new Uint8Array(_buffer)
// //     const { text: pages } = await extractText(uint8)
// //     const text = pages.join('\n\n')
// //     const doc = new Document({
// //       pageContent: text,
// //       metadata: { source: _fileName },
// //     })
// //     const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
// //     const splitDocs = await splitter.splitDocuments([doc])
// //     const [insertedDoc] = await db
// //       .insert(documents)
// //       .values({ title: _fileName ?? 'Document sans titre', source: null })
// //       .returning()
// //     const docsWithMeta = splitDocs.map((chunk: any) => ({
// //       ...chunk,
// //       metadata: { ...chunk.metadata, document_id: insertedDoc?.id },
// //     }))
// //     const store = await createVectorStore()
// //     await store.addDocuments(docsWithMeta)
// //     if (insertedDoc?.id) {
// //       await db.update(chunks)
// //         .set({ documentId: insertedDoc.id })
// //         .where(sql`${chunks.metadata}->>'document_id' = ${String(insertedDoc.id)}`)
// //     }
// //     _buffer = null
// //     _fileName = null
// //     return `PDF vectorisé : ${splitDocs.length} chunks ajoutés. Document id: ${insertedDoc?.id}`
// //   } catch (error) {
// //     console.log('❌ error addRAG => ', error)
// //     return `❌ ${error}`
// //   }
// // }
// export const addDocument = async (fileBuffer: Buffer, fileName: string, mimeType: string, userId: string) => {
//   const bucket = process.env.STORAGE_S3_BUCKET!
//   const fileKey = `${Date.now()}-${fileName}`
//   // 1. Upload sur R2
//   console.log(`[vectors] Uploading ${fileName} to R2`)
//   await s3.send(
//     new PutObjectCommand({
//       Bucket: bucket,
//       Key: fileKey,
//       Body: fileBuffer,
//       ContentType: mimeType,
//     })
//   )
//   console.log(`[vectors] Uploaded to R2: ${fileKey}`)
//   // 2. Insert en DB
//   const [insertedDoc] = await db
//     .insert(documents)
//     .values({ title: fileName, source: fileKey, mimeType, userId: userId })
//     .returning()
//   const documentId = insertedDoc.id
//   console.log(`[vectors] Inserted document ${documentId}`)
//   // 3. Extraction texte + vectorisation
//   const uint8 = new Uint8Array(fileBuffer)
//   const { text: pages } = await extractText(uint8)
//   const text = pages.join('\n\n')
//   console.log(`[vectors] Extracted ${text.length} characters`)
//   const doc = new Document({
//     pageContent: text,
//     metadata: { source: fileKey, document_id: documentId },
//   })
//   const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
//   const splitDocs = await splitter.splitDocuments([doc])
//   console.log(`[vectors] Created ${splitDocs.length} chunks`)
//   const store = await createVectorStore()
//   await store.addDocuments(splitDocs)
//   await db
//     .update(chunks)
//     .set({ documentId })
//     .where(sql`${chunks.metadata}->>'document_id' = ${String(documentId)}`)
//   console.log(`[vectors] Done — ${splitDocs.length} chunks for document ${documentId}`)
//   return { documentId, chunks: splitDocs.length }
// }
