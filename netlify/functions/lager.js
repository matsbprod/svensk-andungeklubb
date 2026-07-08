// Proxy to JSONBin to avoid CORS issues
exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const BIN_ID = process.env.JSONBIN_ID;
  const API_KEY = process.env.JSONBIN_KEY;
  const BASE = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  if (event.httpMethod === 'GET') {
    const res = await fetch(`${BASE}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.record || { stock: {}, lastUpdated: null })
    };
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    const res = await fetch(BASE, {
      method: 'PUT',
      headers: { 'X-Master-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: 'Method not allowed' };
};
