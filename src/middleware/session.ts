import { auth } from '@/lib/auth'
import { createFactory } from 'hono/factory'
import type { Env } from '@/types/env'

const factory = createFactory<Env>()

export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    console.log('session => ', session?.user.name)

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }

    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  } catch (err) {
    console.error('Error in session middleware:', err);
  }

})

