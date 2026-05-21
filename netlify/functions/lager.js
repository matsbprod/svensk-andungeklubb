const { getStore } = require('@netlify/blobs');

const BLOB_KEY = 'andunge-lager-v1';

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Use environment context injected by Netlify automatically
  const store = getStore('lager');

  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get(BLOB_KEY, { type: 'json' });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || { stock: {}, lastUpdated: null })
      };
    } catch(e) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ stock: {}, lastUpdated: null })
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      await store.setJSON(BLOB_KEY, body);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch(e) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: e.message })
      };
    }
  }

  return { statusCode: 405, headers, body: 'Method not allowed' };
};
