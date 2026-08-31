// server/universal_proxy.js - Universal AI Proxy Runner (Gemini & Claude Web2API)

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
    console.log(JSON.stringify({ type: 'error', content: 'Invalid JSON payload received in universal_proxy' }));
    process.exit(1);
  }

  const { character, persona, memories, history, newMessage, apiSettings } = payload;
  const universalModel = apiSettings?.universalModel || 'gemini-3.7-flash';
  
  // Format proxy base URL (default to panel port 8083)
  let rawBaseUrl = (apiSettings?.universalProxyUrl || 'http://127.0.0.1:8083').trim().replace(/\/+$/, '');
  let endpointUrl;
  if (rawBaseUrl.endsWith('/v1/chat/completions')) {
    endpointUrl = rawBaseUrl;
  } else if (rawBaseUrl.endsWith('/v1')) {
    endpointUrl = `${rawBaseUrl}/chat/completions`;
  } else {
    endpointUrl = `${rawBaseUrl}/v1/chat/completions`;
  }

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
  const rawMessages = [];
  if (systemPrompt) {
    rawMessages.push({ role: 'system', content: systemPrompt });
  }

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

  // Normalize consecutive same-role messages for APIs that require alternating roles
  const finalMessages = [];
  for (const msg of rawMessages) {
    if (finalMessages.length === 0) {
      finalMessages.push({ role: msg.role, content: msg.content });
    } else {
      const lastMsg = finalMessages[finalMessages.length - 1];
      if (lastMsg.role === msg.role && msg.role !== 'system') {
        lastMsg.content += `\n\n${msg.content}`;
      } else {
        finalMessages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  // Prepare request body
  const requestBody = {
    model: universalModel,
    messages: finalMessages,
    stream: true
  };

  if (apiSettings?.maxTokens) {
    const parsedMax = parseInt(apiSettings.maxTokens);
    if (!isNaN(parsedMax) && parsedMax > 0) {
      requestBody.max_tokens = parsedMax;
    }
  }

  if (apiSettings?.temperature !== undefined && apiSettings?.temperature !== null && apiSettings?.temperature !== "") {
    const val = Number(apiSettings.temperature);
    if (!isNaN(val)) requestBody.temperature = val;
  }

  if (apiSettings?.topP !== undefined && apiSettings?.topP !== null && apiSettings?.topP !== "") {
    const val = Number(apiSettings.topP);
    if (!isNaN(val)) requestBody.top_p = val;
  }

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP Error ${response.status}: ${errorText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMsg = typeof errorJson.error === 'string' ? errorJson.error : (errorJson.error.message || JSON.stringify(errorJson.error));
        }
      } catch (e) {}

      if (response.status === 401 || errorMsg.toLowerCase().includes('cookie') || errorMsg.toLowerCase().includes('auth')) {
        errorMsg = `🔑 Autentikasi cookie tidak valid atau kedaluwarsa (${universalModel}). Silakan update cookie di menu API Settings > Universal Proxy.`;
      } else if (response.status === 429 || errorMsg.includes('429')) {
        errorMsg = `⏳ Terkena limit kuota sementara (Rate Limit 429) untuk ${universalModel}. Tunggu beberapa menit atau pilih model lain.`;
      }

      console.log(JSON.stringify({ type: 'error', content: errorMsg }));
      process.exit(1);
    }

    // Stream SSE Response
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf8');
    let buffer = '';
    let inThinkTag = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep partial line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);
            const choice = parsed.choices?.[0];
            const delta = choice?.delta;

            if (delta) {
              // 1. Check reasoning / thought chunks
              if (delta.reasoning_content) {
                console.log(JSON.stringify({ type: 'thought', content: delta.reasoning_content }));
              }

              // 2. Check main content text
              if (delta.content) {
                let contentText = delta.content;

                // Handle inline <thought> or <think> tags if model produces them
                if (contentText.includes('<thought>') || contentText.includes('<think>')) {
                  inThinkTag = true;
                  contentText = contentText.replace(/<thought>|<think>/g, '');
                }

                if (inThinkTag) {
                  if (contentText.includes('</thought>') || contentText.includes('</think>')) {
                    const parts = contentText.split(/<\/thought>|<\/think>/);
                    if (parts[0]) {
                      console.log(JSON.stringify({ type: 'thought', content: parts[0] }));
                    }
                    inThinkTag = false;
                    if (parts[1]) {
                      console.log(JSON.stringify({ type: 'text', content: parts[1] }));
                    }
                  } else {
                    console.log(JSON.stringify({ type: 'thought', content: contentText }));
                  }
                } else {
                  console.log(JSON.stringify({ type: 'text', content: contentText }));
                }
              }
            }
          } catch (e) {
            // Non-JSON chunk, treat as raw text
            if (dataStr) {
              console.log(JSON.stringify({ type: 'text', content: dataStr }));
            }
          }
        }
      }
    }
  } catch (err) {
    let msg = err.message || 'Unknown network error';
    if (err.code === 'ECONNREFUSED' || msg.includes('fetch failed')) {
      msg = `⚠️ Universal Proxy tidak dapat dihubungi di ${endpointUrl}.\n\nPastikan service Proxy Gemini / Claude aktif di menu API Settings > Universal Proxy atau jalankan file "start_panel.bat" di folder gemini-claude-web2api.`;
    }
    console.log(JSON.stringify({ type: 'error', content: msg }));
    process.exit(1);
  }
}

main().catch(err => {
  console.log(JSON.stringify({ type: 'error', content: `Universal Proxy Exception: ${err.message}` }));
  process.exit(1);
});
