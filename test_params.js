const proxyUrl = 'http://localhost:8080';

async function test(name, body) {
  console.log(`\nTesting ${name}...`);
  try {
    const res = await fetch(`${proxyUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    console.log(`Status: ${res.status}`);
    if (!res.ok) {
      const text = await res.text();
      console.log(`Error: ${text}`);
    } else {
      console.log('Success (200 OK)');
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

async function runTests() {
  const baseBody = {
    model: 'gemini-3.1-pro-low',
    messages: [{ role: 'user', content: 'hello' }],
    max_tokens: 8192,
    stream: false, // Use false to avoid hanging
    system: 'Your character name is AI.'
  };

  await test('Base (No optional params)', baseBody);
  await test('With temperature', { ...baseBody, temperature: 1 });
  await test('With top_p', { ...baseBody, top_p: 0.95 });
  await test('With top_k', { ...baseBody, top_k: 40 });
  await test('With all', { ...baseBody, temperature: 1, top_p: 0.95, top_k: 40 });
}

runTests();
