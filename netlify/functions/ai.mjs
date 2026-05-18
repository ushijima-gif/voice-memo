export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { prompt } = await req.json();
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || 'エラーが発生しました';

    return Response.json({ text }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return Response.json({ error: e.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
};
