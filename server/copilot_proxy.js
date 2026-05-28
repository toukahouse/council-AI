import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'copilot-data.json');

const randomUUID = () => crypto.randomUUID();

async function getCopilotToken(githubToken) {
  const res = await fetch('https://api.github.com/copilot_internal/v2/token', {
    headers: { 
      'Authorization': `token ${githubToken}`, 
      'Accept': 'application/json',
      'User-Agent': 'GitHubCopilotChat/0.47.1'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to get Copilot token: ${res.statusText}`);
  }
  const data = await res.json();
  return data.token;
}

async function main() {
  let inputData = '';
  process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  if (!inputData.trim()) return;

  const payload = JSON.parse(inputData);
  const { character, persona, memories, history, newMessage, apiSettings } = payload;
  const copilotModel = apiSettings?.copilotModel || 'gpt-4o'; 

  // Build system prompt from character data (matching proxy_ai.py logic)
  const promptParts = [];
  
  const charName = character?.name || 'AI';
  promptParts.push(`You are roleplaying as ${charName}.`);
  
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
  
  // Build messages array for OpenAI-compatible API
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  // Add chat history
  if (history && history.length > 0) {
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    });
  }

  // Add new message if present
  if (newMessage) {
    messages.push({ role: 'user', content: newMessage });
  }

  let githubToken = null;
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      githubToken = data.githubToken;
    } catch (e) {
      // ignore
    }
  }

  if (!githubToken) {
    console.log(JSON.stringify({ type: 'error', content: 'No GitHub token found. Please login via API Settings.' }));
    process.exit(1);
  }

  let copilotToken;
  try {
    copilotToken = await getCopilotToken(githubToken);
  } catch (e) {
    console.log(JSON.stringify({ type: 'error', content: `GitHub Token expired or invalid: ${e.message}` }));
    process.exit(1);
  }

  const deviceId = randomUUID();
  const reqId = randomUUID();

  // Determine reasoning effort based on model name
  const isMinModel = copilotModel.toLowerCase().includes('mini');
  const reasoningEffort = isMinModel ? 'high' : 'xhigh';

  try {
    const requestBody = {
      model: copilotModel,
      messages: messages,
      stream: true,
      reasoning_effort: reasoningEffort,
      preserve_thinking: true
    };

    if (apiSettings?.temperature !== undefined) {
      requestBody.temperature = apiSettings.temperature;
    }
    if (apiSettings?.topP !== undefined) {
      requestBody.top_p = apiSettings.topP;
    }

    const response = await fetch('https://api.githubcopilot.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${copilotToken}`,
        'Content-Type': 'application/json',
        'copilot-integration-id': 'vscode-chat',
        'editor-device-id': deviceId,
        'editor-version': 'vscode/1.85.0',
        'editor-plugin-version': 'copilot-chat/0.47.1',
        'user-agent': 'GitHubCopilotChat/0.47.1',
        'openai-intent': 'conversation-agent',
        'x-github-api-version': '2026-01-09',
        'x-request-id': reqId,
        'x-agent-task-id': reqId,
        'x-interaction-type': 'conversation-agent'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const txt = await response.text();
      console.log(JSON.stringify({ type: 'error', content: `Copilot API Error: ${response.status} ${txt}` }));
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

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.trim().slice(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.choices && data.choices[0].delta) {
                const thoughtChunk = data.choices[0].delta.reasoning_content || data.choices[0].delta.reasoning_text || data.choices[0].delta.reasoning_opaque;
                if (thoughtChunk) {
                    process.stdout.write(JSON.stringify({ type: 'thought', content: thoughtChunk }) + '\n');
                }
                const contentChunk = data.choices[0].delta.content;
                if (contentChunk) {
                    process.stdout.write(JSON.stringify({ type: 'text', content: contentChunk }) + '\n');
                }
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
