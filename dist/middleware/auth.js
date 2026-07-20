import { createFactory } from 'hono/factory';
const factory = createFactory();
export const requireAuth = factory.createMiddleware(async (c, next) => {
    const session = c.get('session');
    if (!session)
        return c.json({ error: 'Unauthorized' }, 401);
    await next();
});
