import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

export const app = new Hono().basePath('/api/v1');

app.use(secureHeaders());

app.get('/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Never return internal details to the client; log only what is needed to
// debug, and no personal data (ISO A.8.15 / A.5.34).
app.onError((err, c) => {
  console.error(
    JSON.stringify({ level: 'error', path: c.req.path, message: err.message, stack: err.stack }),
  );
  return c.json({ error: 'Internal error' }, 500);
});
