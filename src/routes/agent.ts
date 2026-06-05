import { auth } from '@/lib/auth';
import { Hono } from 'hono';
import type { Env } from '@/types/env'

const app = new Hono<Env>();

app.post("/message", (c) => {
  const session = c.get("session");
  if (!session) {
    return c.text("Unauthorized", 401);
  }
  return c.text('session ok keep going !')
});

export default app