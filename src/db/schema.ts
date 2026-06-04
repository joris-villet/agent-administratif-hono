import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  customType,
  foreignKey,
  index,
  integer,
  json,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  vector,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

export const chunks = pgTable(
  'chunks',
  {
    id: serial().primaryKey().notNull(),
    content: text(),
    metadata: jsonb(),
    embedding: vector({ dimensions: 3072 }),
    documentId: integer('document_id'),
  },
  (table) => [
    foreignKey({
      columns: [table.documentId],
      foreignColumns: [documents.id],
      name: 'chunks_document_id_fkey',
    }).onDelete('cascade'),
  ]
)

export const documents = pgTable('documents', {
  id: serial().primaryKey().notNull(),
  title: text().notNull(),
  source: text(), // URL ou chemin du fichier original (S3, R2, local...)
  mimeType: text('mime_type'), // "application/pdf", "text/plain", etc.
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const aiPrompts = pgTable(
  'ai_prompts',
  {
    id: uuid().primaryKey().notNull(),
    sort: integer(),
    dateCreated: timestamp('date_created', { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    userCreated: text('user_created'),
    dateUpdated: timestamp('date_updated', { withTimezone: true, mode: 'string' }),
    userUpdated: text('user_updated'),
    name: varchar({ length: 255 }),
    status: varchar({ length: 255 }).default('draft'),
    description: text(),
    systemPrompt: text('system_prompt'),
    messages: json(),
  },
  (table) => [
    index().using('btree', table.name.asc().nullsLast().op('text_ops')),
    // Par
    foreignKey({
      columns: [table.userCreated],
      foreignColumns: [user.id],
      name: 'ai_prompts_user_created_fkey',
    }),
    foreignKey({
      columns: [table.userUpdated],
      foreignColumns: [user.id],
      name: 'ai_prompts_user_updated_fkey',
    }),
    unique('ai_prompts_name_unique').on(table.name),
  ]
)

export const checkpointMigrations = pgTable('checkpoint_migrations', {
  v: integer().primaryKey().notNull(),
})

export const checkpointBlobs = pgTable(
  'checkpoint_blobs',
  {
    id: serial().primaryKey().notNull(),
    threadId: text('thread_id').notNull(),
    checkpointNs: text('checkpoint_ns').default('').notNull(),
    channel: text().notNull(),
    version: text().notNull(),
    type: text().notNull(),
    blob: bytea('blob'),
  },
  (table) => [unique('checkpoint_blobs_unique').on(table.threadId, table.checkpointNs, table.channel, table.version)]
)

export const checkpoints = pgTable(
  'checkpoints',
  {
    id: serial().primaryKey().notNull(),
    threadId: text('thread_id').notNull(),
    checkpointNs: text('checkpoint_ns').default('').notNull(),
    checkpointId: text('checkpoint_id').notNull(),
    parentCheckpointId: text('parent_checkpoint_id'),
    type: text(),
    checkpoint: jsonb().notNull(),
    metadata: jsonb().default({}).notNull(),
  },
  (table) => [unique('checkpoints_unique').on(table.threadId, table.checkpointNs, table.checkpointId)]
)

export const checkpointWrites = pgTable(
  'checkpoint_writes',
  {
    id: serial().primaryKey().notNull(),
    threadId: text('thread_id').notNull(),
    checkpointNs: text('checkpoint_ns').default('').notNull(),
    checkpointId: text('checkpoint_id').notNull(),
    taskId: text('task_id').notNull(),
    idx: integer().notNull(),
    channel: text().notNull(),
    type: text(),
    blob: bytea('blob').notNull(),
  },
  (table) => [
    unique('checkpoint_writes_unique').on(
      table.threadId,
      table.checkpointNs,
      table.checkpointId,
      table.taskId,
      table.idx
    ),
  ]
)

export const conversations = pgTable(
  'conversations',
  {
    id: serial().primaryKey().notNull(),
    threadId: text('thread_id').notNull(),
    title: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [unique('conversations_thread_id_unique').on(table.threadId)]
)

export const conversationMessages = pgTable(
  'conversation_messages',
  {
    id: serial().primaryKey().notNull(),
    conversationId: integer('conversation_id').notNull(),
    role: varchar({ length: 20 }).notNull(),
    content: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('conversation_messages_conversation_id_idx').using('btree', table.conversationId),
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: 'conversation_messages_conversation_id_fkey',
    }).onDelete('cascade'),
  ]
)
