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
    const body = await req.json();
    const prompt = body.prompt;
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: 'APIキーが設定されていません。Netlifyの環境変数を確認してください。' }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!prompt) {
      return Response.json({ error: 'テキストが空です' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
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

    if (!res.ok) {
      return Response.json({ error: 'API error: ' + (data.error?.message || JSON.stringify(data)) }, {
        status: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const text = data.content?.[0]?.text;
    if (!text) {
      return Response.json({ error: 'APIレスポンスが空です: ' + JSON.stringify(data) }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    return Response.json({ text }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return Response.json({ error: '通信エラー: ' + e.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
};
