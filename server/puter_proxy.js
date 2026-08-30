// server/puter_proxy.js - Puter.js AI Proxy Runner with Multi-Key Pool & Auto-Failover

async function main() {
  let inputData = '';
  process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  if (!inputData.trim()) return;

  let payload;
  try {
    payload = JSON.parse(inputData);
  } catch (err) {
    console.log(JSON.stringify({ type: 'error', content: 'Invalid JSON payload received in puter_proxy' }));
    process.exit(1);
  }

  const { character, persona, memories, history, newMessage, apiSettings } = payload;
  const puterModel = apiSettings?.puterModel || 'claude-3-5-sonnet';

  // Build system prompt from character data
  const promptParts = [];
  const charName = character?.name || 'AI';
  
  promptParts.push(`Your character name is: ${charName}`);
  
  if (character?.systemPrompt) {
    promptParts.push(character.systemPrompt);
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
  const finalMessages = [];
  
  if (systemPrompt) {
    finalMessages.push({ role: 'system', content: systemPrompt });
  }

  if (history && history.length > 0) {
    history.forEach(msg => {
      finalMessages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    });
  }

  // Add new message if present
  if (newMessage) {
    finalMessages.push({ role: 'user', content: newMessage });
  }

  // Key Pool setup
  const rawKeys = Array.isArray(apiSettings?.puterKeys) ? apiSettings.puterKeys : [];
  const activeKeyId = apiSettings?.puterActiveKeyId;

  // Prepare ordered list of keys: active key first, then other ready keys
  let keysToTry = [];
  if (rawKeys.length > 0) {
    const activeKey = rawKeys.find(k => k.id === activeKeyId);
    const otherKeys = rawKeys.filter(k => k.id !== activeKeyId);
    if (activeKey) {
      keysToTry.push(activeKey);
    }
    keysToTry.push(...otherKeys);
  } else {
    // If no keys provided in array, check for single token or guest fallback
    if (apiSettings?.puterToken) {
      keysToTry.push({ id: 'single_key', token: apiSettings.puterToken, label: 'Single Key' });
    }
  }

  if (keysToTry.length === 0) {
    console.log(JSON.stringify({
      type: 'error',
      content: '⚠️ Belum ada Puter Auth Token yang dikonfigurasi. Silakan buka menu API Settings > Puter Proxy dan tambahkan token Puter (atau login akun Puter) pada bagian Multi-Key Pool.'
    }));
    process.exit(1);
  }

  const argsPayload = {
    messages: finalMessages,
    model: puterModel,
    stream: true
  };

  if (apiSettings?.temperature !== undefined && apiSettings?.temperature !== null && apiSettings?.temperature !== "") {
    const val = Number(apiSettings.temperature);
    if (!isNaN(val)) argsPayload.temperature = val;
  }
  
  if (apiSettings?.maxTokens) {
    const parsedMax = parseInt(apiSettings.maxTokens);
    if (!isNaN(parsedMax) && parsedMax > 0) argsPayload.max_tokens = parsedMax;
  }

  let success = false;
  let lastErrorMsg = '';

  for (let attempt = 0; attempt < keysToTry.length; attempt++) {
    const currentKey = keysToTry[attempt];
    const keyToken = currentKey.token ? currentKey.token.trim() : '';
    const keyLabel = currentKey.label || `Key #${attempt + 1}`;

    if (!keyToken) continue;

    try {
      const requestBody = {
        interface: 'puter-chat-completion',
        driver: 'ai-chat',
        method: 'complete',
        args: argsPayload,
        auth_token: keyToken
      };

      const response = await fetch('https://api.puter.com/drivers/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;actually=json',
          'Authorization': `Bearer ${keyToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData.message || errorData.error || `HTTP Error ${status}`;
        const isLimit = /limit|quota|balance|429|unauthorized|rate|reauth_required|token/i.test(msg) || status === 429 || status === 401;

        if (isLimit && attempt < keysToTry.length - 1) {
          lastErrorMsg = `[${keyLabel}] Limit/Error: ${msg}`;
          // Try next key in pool
          continue;
        } else {
          throw new Error(`[${keyLabel}] ${msg}`);
        }
      }

      const contentType = response.headers.get('content-type') || '';
      
      // If JSON response (non-stream or direct result)
      if (contentType.includes('application/json')) {
        const jsonResult = await response.json();
        const textContent = jsonResult?.result?.message?.content || 
                            jsonResult?.message?.content || 
                            jsonResult?.result || 
                            (typeof jsonResult === 'string' ? jsonResult : JSON.stringify(jsonResult));
        console.log(JSON.stringify({ type: 'text', content: textContent }));
        success = true;
        break;
      }

      // Stream NDJSON / SSE Response
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
          buffer = lines.pop(); // keep incomplete tail

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Handle standard SSE `data: ...` or raw NDJSON line
            const rawData = trimmedLine.startsWith('data:') ? trimmedLine.slice(5).trim() : trimmedLine;
            if (rawData === '[DONE]') continue;

            try {
              const parsed = JSON.parse(rawData);
              if (parsed.type === 'error' || parsed.error) {
                const errMsg = parsed.message || parsed.error?.message || parsed.error || 'Stream error';
                throw new Error(errMsg);
              }

              if (parsed.type === 'thought') {
                const thoughtText = parsed.text || parsed.content || '';
                if (thoughtText) {
                  console.log(JSON.stringify({ type: 'thought', content: thoughtText }));
                }
              } else {
                // Text chunk
                const chunkText = (parsed.type === 'text' ? parsed.text : parsed.text) || 
                                  parsed.content || 
                                  (typeof parsed === 'string' ? parsed : '');
                if (chunkText) {
                  console.log(JSON.stringify({ type: 'text', content: chunkText }));
                }
              }
            } catch (err) {
              if (err.message && err.message.includes('Limit')) {
                throw err;
              }
              // If not JSON, output raw string if not an error message
              if (!rawData.startsWith('{') && !rawData.startsWith('[')) {
                console.log(JSON.stringify({ type: 'text', content: rawData }));
              }
            }
          }
        }
      }

      success = true;
      break;

    } catch (err) {
      lastErrorMsg = err.message || String(err);
      const isLimit = /limit|quota|balance|429|unauthorized|rate|reauth/i.test(lastErrorMsg);

      if (isLimit && attempt < keysToTry.length - 1) {
        // Auto-failover to next key
        continue;
      } else {
        console.log(JSON.stringify({
          type: 'error',
          content: `⚠️ Puter Proxy Error: ${lastErrorMsg}\n\n*Tips Anti-Limit: Tambahkan token Puter cadangan di menu API Settings > Puter Proxy.*`
        }));
        process.exit(1);
      }
    }
  }

  if (!success) {
    console.log(JSON.stringify({
      type: 'error',
      content: `⚠️ Semua Puter Key pada Pool mengalami limit atau kegagalan:\n${lastErrorMsg}`
    }));
    process.exit(1);
  }
}

main().catch(err => {
  console.log(JSON.stringify({ type: 'error', content: `Puter fatal error: ${err.message}` }));
  process.exit(1);
});
