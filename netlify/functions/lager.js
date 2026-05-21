const { getStore } = require('@netlify/blobs');

const BLOB_KEY = 'andunge-lager-v1';

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Get store using context token (available in deployed functions)
  const store = getStore({
    name: 'lager',
    consistency: 'strong',
    siteID: process.env.NETLIFY_SITE_ID || context.clientContext?.custom?.netlify,
    token: process.env.NETLIFY_AUTH_TOKEN
  });

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
        body: JSON.stringify({ stock: {}, lastUpdated: null, error: e.message })
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
