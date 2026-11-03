import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('api', () => {
  it('reports health', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('sets security headers', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await app.request('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
