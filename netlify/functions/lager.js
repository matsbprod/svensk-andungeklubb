import { getStore } from '@netlify/blobs';

const BLOB_KEY = 'andunge-lager-v1';

export default async (req, context) => {
  const store = getStore({ name: 'lager', consistency: 'strong' });

  // GET — hämta saldo
  if (req.method === 'GET') {
    try {
      const data = await store.get(BLOB_KEY, { type: 'json' });
      return Response.json(data || { stock: {}, lastUpdated: null });
    } catch (e) {
      return Response.json({ stock: {}, lastUpdated: null });
    }
  }

  // POST — spara saldo
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      await store.setJSON(BLOB_KEY, body);
      return Response.json({ ok: true });
    } catch (e) {
      return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/lager' };
