import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

app.get('/', async (c) => {
  const file = Bun.file('./static/index.html')
  const page = await file.text();
  return c.html(page)
})



export default {
  port: 7000,
  fetch: app.fetch,
} 
