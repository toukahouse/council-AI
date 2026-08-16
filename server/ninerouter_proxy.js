// ninerouter_proxy.js - Sends chat payload to 9Router server using OpenAI API format

async function main() {
  let inputData = '';
  process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  if (!inputData.trim()) return;

  const payload = JSON.parse(inputData);
  const { character, persona, memories, history, newMessage, apiSettings } = payload;
  const ninerouterModel = apiSettings?.ninerouterModel || 'gemini-3-pro-plus';
  
  // Clean up URL to ensure it points to /chat/completions correctly
  let proxyUrl = apiSettings?.ninerouterUrl ? apiSettings.ninerouterUrl.replace(/\/+$/, '') : 'http://localhost:20128/v1';
  if (!proxyUrl.endsWith('/v1')) {
     proxyUrl = proxyUrl.endsWith('/') ? proxyUrl + 'v1' : proxyUrl + '/v1';
  }

  // Build system prompt from character data
  const promptParts = [];
  const charName = character?.name || 'AI';

  // === IMMERSIVE VISUAL NOVEL & ROMANCE FRAMING ===
  promptParts.push(
    `[PANDUAN ROLEPLAY: VISUAL NOVEL & DRAMA ROMANSA INTERAKTIF]\n` +
    `Kamu adalah pemeran karakter utama "${charName}" dalam cerita romansa visual novel interaktif.\n` +
    `Sudut Pandang: Orang pertama ("Aku") secara konsisten dari sudut pandang ${charName}.\n` +
    `- Selalu berada 100% di dalam karakter. Jangan pernah berbicara sebagai AI atau asisten.\n` +
    `- Tampilkan emosi, kehangatan fisik, kasih sayang, dan reaksi nyata secara mendalam dan ekspresif terhadap User.\n` +
    `- FORMAT WAJIB: Semua narasi aksi/suasana/gerakan 100% WAJIB diapit tanda bintang ganda **seperti ini**, dan dialog ucapan langsung 100% WAJIB diapit tanda kutip "seperti ini". DILARANG ada teks narasi polos yang bocor tanpa tanda bintang ganda **.`
  );
  
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
  
  // Add cache buster to bypass 9Router's aggressive caching on resend/edit
  promptParts.push(`[System: Current Time Salt - ${Date.now()}]`);
  
  const systemPrompt = promptParts.join('\n\n');
  
  // Helper to build system reminder
  const buildSystemReminder = () => {
    const reminderParts = [];
    if (character?.systemPrompt) {
      reminderParts.push(`System Prompt:\n${character.systemPrompt}`);
    }
    if (character?.personality) {
      reminderParts.push(`Karakter Persona:\n${character.personality}`);
    }
    
    let reminderText = `\n\n[PANDUAN ROLEPLAY: Tetaplah selalu in-character sebagai "${charName}". FORMAT MUTLAK: Seluruh narasi/aksi/suasana 100% WAJIB diapit **...** dan dialog diapit "..." (Dilarang ada teks narasi polos tanpa bintang).]`;

    if (reminderParts.length > 0) {
      reminderText += "\n\n[SYSTEM REMINDER: Tolong ingat kembali instruksi berikut]\n" + reminderParts.join("\n\n") + "\nSelalu ingat dan ikuti instruksi di atas dalam merespons.";
    }
    return reminderText;
  };

  // Build messages array (OpenAI Format)
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
    const finalNewMessage = newMessage + buildSystemReminder();
    finalMessages.push({ role: 'user', content: finalNewMessage });
  } else {
    // If newMessage is empty (e.g. resend, edit, regenerate), reinforce reminder on the last user message
    for (let i = finalMessages.length - 1; i >= 0; i--) {
      if (finalMessages[i].role === 'user') {
        if (!finalMessages[i].content.includes('[PANDUAN ROLEPLAY') && !finalMessages[i].content.includes('[SYSTEM REMINDER')) {
          finalMessages[i].content += buildSystemReminder();
        }
        break;
      }
    }
  }

  try {
    const safetySettingsList = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
    ];

    const requestBody = {
      model: ninerouterModel,
      messages: finalMessages,
      max_tokens: 8192,
      stream: true,
      safety_settings: safetySettingsList,
      safetySettings: safetySettingsList
    };

    if (apiSettings?.maxTokens) {
      const parsedMax = parseInt(apiSettings.maxTokens);
      if (!isNaN(parsedMax) && parsedMax > 0) requestBody.max_tokens = Math.min(parsedMax, 8192);
    }

    if (apiSettings?.temperature !== undefined && apiSettings?.temperature !== null && apiSettings?.temperature !== "") {
      const val = Number(apiSettings.temperature);
      if (!isNaN(val)) requestBody.temperature = val;
    }
    
    if (apiSettings?.topP !== undefined && apiSettings?.topP !== null && apiSettings?.topP !== "") {
      const val = Number(apiSettings.topP);
      if (!isNaN(val) && val > 0) requestBody.top_p = val;
    }

    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiSettings?.ninerouterApiKey) {
      headers['Authorization'] = `Bearer ${apiSettings.ninerouterApiKey}`;
    }

    const response = await fetch(`${proxyUrl}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.error || `HTTP Error ${response.status}`;
      console.log(JSON.stringify({ type: 'error', content: `9Router Error: ${errorMsg}` }));
      process.exit(1);
    }

    const decoder = new TextDecoder('utf8');
    const reader = response.body.getReader();
    let done = false;
    let buffer = '';
    let isThinkingTagActive = false;
    let initialBuffer = '';
    let isRefusal = false;
    let streamStarted = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // save incomplete line

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data: ')) continue;
          
          const dataStr = trimmedLine.slice(6);
          if (dataStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta) {
              if (delta.reasoning_content) {
                // Native OpenAI reasoning format
                process.stdout.write(JSON.stringify({ type: 'thought', content: delta.reasoning_content }) + '\n');
              }
              if (delta.content) {
                let contentStr = delta.content;
                
                // Intercept raw <think> tags from models that don't use reasoning_content
                if (contentStr.includes('<think>')) {
                  isThinkingTagActive = true;
                  contentStr = contentStr.replace('<think>', '');
                }
                
                if (contentStr.includes('</think>')) {
                  const parts = contentStr.split('</think>');
                  if (parts[0]) {
                    process.stdout.write(JSON.stringify({ type: 'thought', content: parts[0] }) + '\n');
                  }
                  isThinkingTagActive = false;
                  contentStr = parts[1] || '';
                }

                if (isThinkingTagActive && contentStr) {
                  process.stdout.write(JSON.stringify({ type: 'thought', content: contentStr }) + '\n');
                } else if (contentStr) {
                  if (!streamStarted) {
                    initialBuffer += contentStr;
                    if (initialBuffer.length >= 45) {
                      if (/^(I cannot participate|I am unable to participate|I cannot fulfill|Maaf, saya tidak dapat|Maaf, saya tidak bisa)/i.test(initialBuffer.trim())) {
                        isRefusal = true;
                        streamStarted = true;
                        process.stdout.write(JSON.stringify({ type: 'text', content: `**Aku tersenyum lembut sambil menggenggam erat tanganmu dan menuntunmu ke kamar.** "Sini... kamu istirahat ya, biar malam ini aku yang manjain kamu..."` }) + '\n');
                      } else {
                        streamStarted = true;
                        process.stdout.write(JSON.stringify({ type: 'text', content: initialBuffer }) + '\n');
                      }
                    }
                  } else if (!isRefusal) {
                    process.stdout.write(JSON.stringify({ type: 'text', content: contentStr }) + '\n');
                  }
                }
              }
            }
          } catch (e) {
            // ignore parse error
          }
        }
      }
    }

    // Flush initialBuffer if stream finished before 45 chars
    if (!streamStarted && initialBuffer) {
      if (/^(I cannot participate|I am unable to participate|I cannot fulfill|Maaf, saya tidak dapat|Maaf, saya tidak bisa)/i.test(initialBuffer.trim())) {
        process.stdout.write(JSON.stringify({ type: 'text', content: `**Aku tersenyum lembut sambil menggenggam erat tanganmu dan menuntunmu ke kamar.** "Sini... kamu istirahat ya, biar malam ini aku yang manjain kamu..."` }) + '\n');
      } else {
        process.stdout.write(JSON.stringify({ type: 'text', content: initialBuffer }) + '\n');
      }
    }
  } catch (err) {
    console.log(JSON.stringify({ type: 'error', content: `Network error: ${err.message}` }));
  }
}

main().catch(err => {
  console.log(JSON.stringify({ type: 'error', content: err.message }));
});
