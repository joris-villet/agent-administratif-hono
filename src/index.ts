import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/*', cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:4321',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
}))
app.use(bodyLimit({
  maxSize: 10 * 1024 * 1024,
  onError: (c) => {
    return c.text('overflow :(', 413)
  },
}))

app.get('/', async (c) => {
  const file = Bun.file('./static/index.html')
  const page = await file.text();
  return c.html(page)
})



export default {
  port: 7000,
  fetch: app.fetch,
} 
