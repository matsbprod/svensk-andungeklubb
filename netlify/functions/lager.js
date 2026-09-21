// Proxy to JSONBin to avoid CORS issues
exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const BIN_ID = process.env.JSONBIN_ID;
  const API_KEY = process.env.JSONBIN_KEY;
  const BASE = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  // Timeout-hjälpare — ger upp mot JSONBin efter 8s istället för att hänga
  function fetchWithTimeout(url, opts, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...opts, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  }

  if (!BIN_ID || !API_KEY) {
    console.error('JSONBIN_ID eller JSONBIN_KEY saknas i miljövariablerna');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Saknar JSONBIN_ID eller JSONBIN_KEY' })
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const res = await fetchWithTimeout(`${BASE}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      }, 8000);

      if (!res.ok) {
        const text = await res.text();
        console.error('JSONBin GET fel:', res.status, text);
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'JSONBin svarade med fel', status: res.status, detail: text })
        };
      }

      const data = await res.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data.record || { stock: {}, lastUpdated: null })
      };
    } catch (err) {
      console.error('JSONBin GET timeout/nätverksfel:', err.message);
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ error: 'JSONBin svarade inte i tid', detail: err.message })
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      const res = await fetchWithTimeout(BASE, {
        method: 'PUT',
        headers: { 'X-Master-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }, 8000);

      if (!res.ok) {
        const text = await res.text();
        console.error('JSONBin PUT fel:', res.status, text);
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'JSONBin svarade med fel', status: res.status, detail: text })
        };
      }

      await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      console.error('JSONBin POST timeout/nätverksfel:', err.message);
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ error: 'JSONBin svarade inte i tid', detail: err.message })
      };
    }
  }

  return { statusCode: 405, headers, body: 'Method not allowed' };
};
