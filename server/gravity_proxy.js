// gravity_proxy.js - Sends chat payload to Antigravity server

async function main() {
  let inputData = '';
  process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  if (!inputData.trim()) return;

  const payload = JSON.parse(inputData);
  const { character, persona, memories, history, newMessage, apiSettings } = payload;
  const gravityModel = apiSettings?.gravityModel || 'claude-sonnet-4-6';
  const proxyUrl = apiSettings?.gravityProxyUrl ? apiSettings.gravityProxyUrl.replace(/\/+$/, '') : 'http://localhost:8080';

  // Build system prompt from character data (matching proxy_ai.py logic)
  const promptParts = [];
  
  const charName = character?.name || 'AI';
  promptParts.push(`Your character name is: ${charName}`);
  
  if (character?.systemPrompt) {
    promptParts.push(`System Prompt:\n${character.systemPrompt}`);
  }
  if (character?.personality) {
    promptParts.push(`Karakter Persona:\n${character.personality}`);
  }
  if (character?.sampleDialog) {
    promptParts.push(`Contoh Dialog:\n${character.sampleDialog}`);
  }
  
  // User Persona
  if (persona?.description) {
    promptParts.push(`Deskripsi User:\n${persona.description}`);
  }
  
  // Memories
  if (memories && memories.length > 0) {
    promptParts.push(`Memory Karakter AI:\n${memories.map(m => `- ${m}`).join('\n')}`);
  }
  
  const systemPrompt = promptParts.join('\n\n');
  
  // Build messages array

  
  // Add chat history
  const rawMessages = [];
  if (history && history.length > 0) {
    history.forEach(msg => {
      rawMessages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    });
  }

  // Add new message if present
  if (newMessage) {
    rawMessages.push({ role: 'user', content: newMessage });
  }

  // Anthropic/Gemini APIs strictly require alternating messages starting with 'user'.
  // We must group consecutive messages of the same role to prevent 400 INVALID_ARGUMENT.
  const finalMessages = [];
  for (const msg of rawMessages) {
    if (finalMessages.length === 0) {
      if (msg.role === 'assistant') {
        // Must start with user
        finalMessages.push({ role: 'user', content: '(Empty user message to satisfy API)' });
      }
      finalMessages.push(msg);
    } else {
      const lastMsg = finalMessages[finalMessages.length - 1];
      if (lastMsg.role === msg.role) {
        // Group consecutive messages of the same role
        lastMsg.content += `\n\n${msg.content}`;
      } else {
        finalMessages.push(msg);
      }
    }
  }

  try {
    const requestBody = {
      model: gravityModel,
      messages: finalMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 8192,
      stream: true
    };

    if (apiSettings?.maxTokens) {
      const parsedMax = parseInt(apiSettings.maxTokens);
      if (!isNaN(parsedMax) && parsedMax > 0) requestBody.max_tokens = Math.min(parsedMax, 8192);
    }

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    // Only include optional parameters if they are strictly defined, exactly like chat.js did.
    // Also skip passing topK entirely to avoid Cloud Code rejection.
    if (apiSettings?.temperature !== undefined && apiSettings?.temperature !== null && apiSettings?.temperature !== "") {
      const val = Number(apiSettings.temperature);
      if (!isNaN(val)) requestBody.temperature = val;
    }
    
    if (apiSettings?.topP !== undefined && apiSettings?.topP !== null && apiSettings?.topP !== "") {
      const val = Number(apiSettings.topP);
      if (!isNaN(val) && val > 0) requestBody.top_p = val;
    }
    
    if (apiSettings?.topK !== undefined && apiSettings?.topK !== null && apiSettings?.topK !== "") {
      const val = Number(apiSettings.topK);
      if (!isNaN(val) && val >= 1) requestBody.top_k = val;
    }


    const response = await fetch(`${proxyUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP Error ${response.status}`;
      console.log(JSON.stringify({ type: 'error', content: `Gravity Proxy Error: ${errorMsg}` }));
      process.exit(1);
    }

    const decoder = new TextDecoder('utf8');
    const reader = response.body.getReader();
    let done = false;
    let buffer = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // save incomplete line

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.trim().slice(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === 'content_block_delta' || parsed.type === 'content_block_delta') {
                const delta = parsed.delta;
                if (delta && delta.type === 'text_delta' && delta.text) {
                  process.stdout.write(JSON.stringify({ type: 'text', content: delta.text }) + '\n');
                } else if (delta && delta.type === 'thinking_delta' && delta.thinking) {
                  process.stdout.write(JSON.stringify({ type: 'thought', content: delta.thinking }) + '\n');
                }
              } else if (eventType === 'error' || parsed.type === 'error') {
                process.stdout.write(JSON.stringify({ type: 'error', content: parsed.error?.message || 'Stream error' }) + '\n');
              }
            } catch (e) {
              // ignore parse error
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(JSON.stringify({ type: 'error', content: `Network error: ${err.message}` }));
  }
}

main().catch(err => {
  console.log(JSON.stringify({ type: 'error', content: err.message }));
});
