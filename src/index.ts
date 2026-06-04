import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { serveStatic } from 'hono/bun'
import { auth } from './lib/auth'
import type { User, Session } from 'better-auth/db'
// import { seedAdmin } from '@/db/seed'


type Env = {
  Variables: {
    user: User | null
    session: Session | null
  }
}

const app = new Hono<Env>()

app.use(logger())
app.use('/static/*', serveStatic({ root: './' }))
app.use('*', cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:4321',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
}))
app.use(bodyLimit({
  maxSize: 2 * 1024 * 1024,
  onError: (c) => {
    return c.text('overflow :(', 413)
  },
}))
app.use(secureHeaders())

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  console.log('session => ', session)

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get('/', async (c) => {
  //console.log('session ? ', c.get('session'))
  const file = Bun.file('./static/index.html')
  const page = await file.text();
  return c.html(page)
})

export default {
  port: 7000,
  fetch: app.fetch,
} 
