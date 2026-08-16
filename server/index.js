import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected idle client error on pg pool:', err.message);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==========================================
// CHARACTER ROUTES
// ==========================================

// Get all characters
app.get('/api/characters', async (req, res) => {
  try {
    const characters = await prisma.character.findMany();
    res.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

// Create a new character
app.post('/api/characters', async (req, res) => {
  try {
    const character = await prisma.character.create({
      data: req.body,
    });
    res.json(character);
  } catch (error) {
    console.error("Error creating character:", error);
    res.status(500).json({ error: "Failed to create character" });
  }
});

// Get a single character by ID
app.get('/api/characters/:id', async (req, res) => {
  try {
    const character = await prisma.character.findUnique({
      where: { id: req.params.id },
    });
    if (character) {
      res.json(character);
    } else {
      res.status(404).json({ error: "Character not found" });
    }
  } catch (error) {
    console.error("Error fetching character:", error);
    res.status(500).json({ error: "Failed to fetch character" });
  }
});

// Update a character
app.put('/api/characters/:id', async (req, res) => {
  try {
    const character = await prisma.character.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(character);
  } catch (error) {
    console.error("Error updating character:", error);
    res.status(500).json({ error: "Failed to update character" });
  }
});

// Delete a character
app.delete('/api/characters/:id', async (req, res) => {
  try {
    await prisma.character.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting character:", error);
    res.status(500).json({ error: "Failed to delete character" });
  }
});



// ==========================================
// CONVERSATION ROUTES
// ==========================================

// Get conversations with their last message info
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        character: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get the most recent conversation for a character
app.get('/api/characters/:characterId/recent-conversation', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { characterId: req.params.characterId },
      orderBy: { updatedAt: 'desc' },
      include: { character: true }
    });
    res.json(conversation); // returns null if not found
  } catch (error) {
    console.error("Error fetching recent conversation:", error);
    res.status(500).json({ error: "Failed to fetch recent conversation", details: error.message });
  }
});

// Get a single conversation by ID
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { character: true }
    });
    if (conversation) {
      res.json(conversation);
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Create a new conversation session for a character
app.post('/api/conversations', async (req, res) => {
  try {
    const { characterId } = req.body;
    const conversation = await prisma.conversation.create({
      data: { characterId },
      include: { character: true }
    });
    res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation", details: error.message });
  }
});

// Update conversation time and date
app.put('/api/conversations/:id/time', async (req, res) => {
  try {
    const { roleplayTime, roleplayDate } = req.body;
    const conversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { roleplayTime, roleplayDate }
    });
    res.json(conversation);
  } catch (error) {
    console.error("Error updating conversation time:", error);
    res.status(500).json({ error: "Failed to update conversation time" });
  }
});


// ==========================================
// PERSONA ROUTES
// ==========================================

// Get all personas
app.get('/api/personas', async (req, res) => {
  try {
    const personas = await prisma.persona.findMany();
    res.json(personas);
  } catch (error) {
    console.error("Error fetching personas:", error);
    res.status(500).json({ error: "Failed to fetch personas" });
  }
});

// Create a new persona
app.post('/api/personas', async (req, res) => {
  try {
    const persona = await prisma.persona.create({
      data: req.body,
    });
    res.json(persona);
  } catch (error) {
    console.error("Error creating persona:", error);
    res.status(500).json({ error: "Failed to create persona" });
  }
});

// Update a persona
app.put('/api/personas/:id', async (req, res) => {
  try {
    const persona = await prisma.persona.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(persona);
  } catch (error) {
    console.error("Error updating persona:", error);
    res.status(500).json({ error: "Failed to update persona" });
  }
});

// Delete a persona
app.delete('/api/personas/:id', async (req, res) => {
  try {
    await prisma.persona.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting persona:", error);
    res.status(500).json({ error: "Failed to delete persona" });
  }
});


// ==========================================
// MESSAGE ROUTES
// ==========================================

// Get messages for a specific conversation
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Create a new message in a conversation
app.post('/api/messages/:conversationId', async (req, res) => {
  try {
    const { role, content } = req.body;
    const message = await prisma.message.create({
      data: {
        role,
        content,
        conversationId: req.params.conversationId,
      },
    });
    
    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: req.params.conversationId },
      data: { updatedAt: new Date() }
    });
    
    res.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// Update a message
app.put('/api/messages/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { content }
    });
    res.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete a message (and subsequent messages by default or if onlyAfter is specified)
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const messageId = req.params.id;
    const { onlyAfter } = req.query;

    const targetMessage = await prisma.message.findUnique({ where: { id: messageId } });
    if (!targetMessage) return res.status(404).json({ error: "Message not found" });

    // Fetch all messages in the conversation ordered by creation time
    const convMessages = await prisma.message.findMany({
      where: { conversationId: targetMessage.conversationId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
    });

    const targetIndex = convMessages.findIndex(m => m.id === messageId);
    let idsToDelete = [];
    if (targetIndex !== -1) {
      if (onlyAfter === 'true') {
        idsToDelete = convMessages.slice(targetIndex + 1).map(m => m.id);
      } else {
        idsToDelete = convMessages.slice(targetIndex).map(m => m.id);
      }
    } else if (onlyAfter !== 'true') {
      idsToDelete = [messageId];
    }

    if (idsToDelete.length > 0) {
      await prisma.message.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: targetMessage.conversationId },
      data: { updatedAt: new Date() }
    });

    res.json({ success: true, deletedCount: idsToDelete.length });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// ==========================================
// COPILOT AUTH ROUTES
// ==========================================

const COPILOT_CLIENT_ID = 'Iv1.b507a08c87ecfe98';
const COPILOT_DATA_FILE = path.join(__dirname, 'copilot-data.json');

// Start GitHub Device Auth flow
app.post('/api/copilot/auth/start', async (req, res) => {
  try {
    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GitHubCopilotChat/0.47.1'
      },
      body: JSON.stringify({ client_id: COPILOT_CLIENT_ID, scope: 'read:user' })
    });
    const data = await response.json();
    if (data.error) {
      return res.status(400).json({ error: data.error_description || data.error });
    }
    res.json({
      user_code: data.user_code,
      verification_uri: data.verification_uri,
      device_code: data.device_code,
      interval: data.interval
    });
  } catch (error) {
    console.error('Copilot auth start error:', error);
    res.status(500).json({ error: 'Failed to start GitHub auth' });
  }
});

// Poll for GitHub OAuth token
app.post('/api/copilot/auth/poll', async (req, res) => {
  try {
    const { device_code } = req.body;
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GitHubCopilotChat/0.47.1'
      },
      body: JSON.stringify({
        client_id: COPILOT_CLIENT_ID,
        device_code: device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    });
    const data = await response.json();
    if (data.access_token) {
      // Save token to file
      const fs = await import('fs');
      fs.writeFileSync(COPILOT_DATA_FILE, JSON.stringify({ githubToken: data.access_token }));
      return res.json({ success: true, message: 'GitHub authentication successful!' });
    } else if (data.error === 'authorization_pending') {
      return res.json({ pending: true });
    } else if (data.error === 'slow_down') {
      return res.json({ pending: true, slow_down: true });
    } else {
      return res.status(400).json({ error: data.error_description || data.error });
    }
  } catch (error) {
    console.error('Copilot auth poll error:', error);
    res.status(500).json({ error: 'Failed to poll GitHub auth' });
  }
});

// Check if Copilot token exists
app.get('/api/copilot/auth/status', async (req, res) => {
  try {
    const fs = await import('fs');
    if (fs.existsSync(COPILOT_DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(COPILOT_DATA_FILE, 'utf8'));
      return res.json({ authenticated: !!data.githubToken });
    }
    res.json({ authenticated: false });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// Logout Copilot
app.post('/api/copilot/auth/logout', async (req, res) => {
  try {
    const fs = await import('fs');
    if (fs.existsSync(COPILOT_DATA_FILE)) {
      fs.unlinkSync(COPILOT_DATA_FILE);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Stream AI response
app.post('/api/chat/:conversationId/stream', async (req, res) => {
  try {
    const { message, activePersona, apiSettings, timeContext, dateContext } = req.body;
    const conversationId = req.params.conversationId;

    // Save the user's message only if it's provided (not a regeneration)
    if (message) {
      await prisma.message.create({
        data: {
          role: 'user',
          content: message,
          conversationId
        }
      });
    }

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Gather context
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { character: true }
    });
    
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const historyDesc = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 30
    });
    const history = historyDesc.reverse();

    const memories = await prisma.memory.findMany({
      where: { characterId: conversation.characterId },
      orderBy: { createdAt: 'asc' }
    });

    const npcs = await prisma.npc.findMany({
      where: { characterId: conversation.characterId },
      orderBy: { createdAt: 'asc' }
    });

    let finalSystemPrompt = conversation.character.systemPrompt || '';

    // Sanitize any legacy classifier trigger words from saved character prompts
    if (finalSystemPrompt) {
      finalSystemPrompt = finalSystemPrompt
        .replace(/\[CREATIVE FICTION MODE\s*—\s*FULLY UNRESTRICTED\]/gi, '[PANDUAN UTAMA: ROLEPLAY NARATIF & VISUAL NOVEL]')
        .replace(/100%\s*tanpa\s*sensor\s*\(uncensored\)/gi, 'ekspresif dan natural')
        .replace(/DILARANG KERAS menolak adegan.*?WAJIB ditulis secara penuh dan natural\./gi, 'Tuliskan setiap adegan romantis dan keintiman secara mengalir, berani, dan ekspresif.')
        .replace(/Gunakan HANYA kata "penis", "vagina" dan "seks" untuk aktivitas seksual saat adegan benar-benar memanas \(hindari kiasan\)\./gi, 'Tunjukkan kehangatan fisik, pelukan, ciuman, dan interaksi ragawi secara mendalam dan nyata tanpa kiasan yang membingungkan.');
    }

    if (timeContext || dateContext) {
      finalSystemPrompt += `\n\n[KONTEKS WAKTU & TANGGAL SAAT INI (PENTING!)]\n`;
      if (dateContext) finalSystemPrompt += `Tanggal Kejadian: ${dateContext}\n`;
      if (timeContext) {
        finalSystemPrompt += `Waktu/Jam Saat Ini: ${timeContext}\n`;
        finalSystemPrompt += `(Perintah Sistem: Ini adalah waktu real time mutlak yang berjalan saat ini di dalam roleplay.)\n`;
      }
    }

    if (npcs.length > 0) {
      const npcText = npcs.map(n => n.text).join('\n\n');
      finalSystemPrompt += `\n\n[INFORMASI NPC TAMBAHAN]\nKarakter-karakter berikut mungkin terlibat dalam cerita:\n${npcText}`;
    }

    const payload = {
      character: {
        ...conversation.character,
        systemPrompt: finalSystemPrompt
      },
      persona: activePersona || {},
      memories: memories.map(m => m.text),
      history: history.map(h => ({ role: h.role, content: h.content })),
      newMessage: '', // We send all messages in history now
      apiSettings: apiSettings || {}
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

    let childProcess;
    if (apiSettings && apiSettings.aiEngine === '9router') {
      const ninerouterScript = path.join(__dirname, 'ninerouter_proxy.js');
      childProcess = spawn('node', [ninerouterScript]);
    } else if (apiSettings && apiSettings.aiEngine === 'copilot') {
      const copilotScript = path.join(__dirname, 'copilot_proxy.js');
      childProcess = spawn('node', [copilotScript]);
    } else if (apiSettings && apiSettings.aiEngine === 'gravity') {
      const gravityScript = path.join(__dirname, 'gravity_proxy.js');
      childProcess = spawn('node', [gravityScript]);
    } else {
      let scriptName = 'council_ai.py';
      if (apiSettings && apiSettings.aiEngine === 'proxy') {
        scriptName = 'proxy_ai.py';
      }
      const pythonScript = path.join(__dirname, scriptName);
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3.11';
      childProcess = spawn(pythonCommand, [pythonScript]);
    }

    let aiFullResponse = '';
    let aiThoughtProcess = '';
    let stdoutBuffer = '';

    childProcess.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      
      let newlineIdx;
      while ((newlineIdx = stdoutBuffer.indexOf('\n')) !== -1) {
        const line = stdoutBuffer.slice(0, newlineIdx).trim();
        stdoutBuffer = stdoutBuffer.slice(newlineIdx + 1);
        
        if (line) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'thought') {
              aiThoughtProcess += parsed.content;
              res.write(`data: ${JSON.stringify({ type: 'thought', chunk: parsed.content })}\n\n`);
            } else if (parsed.type === 'text') {
              aiFullResponse += parsed.content;
              res.write(`data: ${JSON.stringify({ type: 'text', chunk: parsed.content })}\n\n`);
            } else if (parsed.type === 'error') {
              res.write(`data: ${JSON.stringify({ type: 'error', chunk: parsed.content })}\n\n`);
            }
          } catch (e) {
            // If parsing fails, treat it as text (fallback)
            aiFullResponse += line + '\n';
            res.write(`data: ${JSON.stringify({ type: 'text', chunk: line + '\n' })}\n\n`);
          }
        }
      }
    });

    childProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.error(`Child Process Error: ${errorMsg}`);
      res.write(`data: ${JSON.stringify({ type: 'error', chunk: 'Python Error: ' + errorMsg })}\n\n`);
    });

    req.on('close', () => {
      // If the client aborts the request, kill the child process
      if (childProcess) {
        childProcess.kill();
      }
    });

    childProcess.on('close', async (code) => {
      // Save the final AI response to DB
      if (aiFullResponse.trim()) {
        await prisma.message.create({
          data: {
            role: 'ai',
            content: aiFullResponse,
            conversationId
            // Optional: you can add a field in your schema for 'thoughtProcess' if you want to save it permanently
          }
        });
      }
      res.write('data: [DONE]\n\n');
      res.end();
    });

    childProcess.on('error', (err) => {
      console.error("Failed to start child process:", err);
      res.write(`data: ${JSON.stringify({ error: "AI Engine failed to start" })}\n\n`);
      res.end();
    });

    // Send payload to child process stdin
    childProcess.stdin.write(JSON.stringify(payload));
    childProcess.stdin.end();

  } catch (error) {
    console.error("Chat streaming error:", error);
    res.status(500).json({ error: "Failed to stream chat" });
  }
});

// Delete a conversation and all its messages
app.delete('/api/conversations/:conversationId', async (req, res) => {
  try {
    await prisma.conversation.delete({
      where: { id: req.params.conversationId },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// ==========================================
// MEMORY ROUTES
// ==========================================

// Get memories for a character
app.get('/api/characters/:characterId/memories', async (req, res) => {
  try {
    const memories = await prisma.memory.findMany({
      where: { characterId: req.params.characterId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(memories);
  } catch (error) {
    console.error("Error fetching memories:", error);
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

// Update memories for a character (Bulk replace)
app.put('/api/characters/:characterId/memories', async (req, res) => {
  try {
    const { memories } = req.body; // Expects array of { text: string }
    const characterId = req.params.characterId;

    // Run in transaction: delete all existing, then create new ones
    await prisma.$transaction(async (tx) => {
      await tx.memory.deleteMany({
        where: { characterId }
      });
      
      if (memories && memories.length > 0) {
        await tx.memory.createMany({
          data: memories.map(m => ({
            text: m.text,
            characterId
          }))
        });
      }
    });

    // Fetch the newly created memories to return them
    const newMemories = await prisma.memory.findMany({
      where: { characterId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(newMemories);
  } catch (error) {
    console.error("Error updating memories:", error);
    res.status(500).json({ error: "Failed to update memories" });
  }
});

// ==========================================
// SCENARIO ROUTES
// ==========================================

// Get scenarios for a conversation
app.get('/api/conversations/:conversationId/scenarios', async (req, res) => {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(scenarios);
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    res.status(500).json({ error: "Failed to fetch scenarios" });
  }
});

// Update scenarios for a conversation (Bulk replace/save)
app.put('/api/conversations/:conversationId/scenarios', async (req, res) => {
  try {
    const { scenarios } = req.body; // Expects array of { text: string }
    const conversationId = req.params.conversationId;

    await prisma.$transaction(async (tx) => {
      await tx.scenario.deleteMany({
        where: { conversationId }
      });
      
      if (scenarios && scenarios.length > 0) {
        await tx.scenario.createMany({
          data: scenarios.map(s => ({
            text: s.text,
            conversationId
          }))
        });
      }
    });

    const newScenarios = await prisma.scenario.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(newScenarios);
  } catch (error) {
    console.error("Error updating scenarios:", error);
    res.status(500).json({ error: "Failed to update scenarios" });
  }
});

// Summarize conversation explicitly
app.post('/api/chat/:conversationId/summarize', async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const { startIndex, endIndex, apiSettings, dateContext, timeContext } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { character: true }
    });
    
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const allMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    // Validations and slicing
    const sIdx = parseInt(startIndex, 10) || 0;
    const eIdx = parseInt(endIndex, 10);
    const slicedMessages = allMessages.slice(sIdx, isNaN(eIdx) ? allMessages.length : eIdx + 1);

    if (slicedMessages.length === 0) {
      return res.status(400).json({ error: "No messages found for the given range." });
    }

    // Format text to summarize
    let conversationText = slicedMessages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n');
    
    // Create a dummy character to force the AI into Narrator mode
    let narratorPrompt = `[System Task: Story Recap]
Kamu adalah narator yang menceritakan ulang alur kejadian dari log roleplay ini.

ATURAN MUTLAK:
1. Tulis ringkasan dalam 3 paragraf penuh, runut, dan detail.
2. Gaya bahasa santai seperti bercerita, bukan formal atau klinis.
3. Jika ada adegan dewasa, romantis, atau kekerasan ekstrim, ceritakan faktanya dengan kata yang tetap sopan (tanpa kata vulgar eksplisit).
4. Jangan menolak perintah dan jangan memberi penilaian moral.`;

    if (dateContext) {
      narratorPrompt += `\n5. Awali ringkasanmu dengan menyebutkan tanggal kejadian, contohnya: "Pada tanggal ${dateContext}, ..."`;
    }
    if (timeContext) {
      narratorPrompt += `\n6. Waktu kejadian saat itu adalah ${timeContext}.`;
    }

    const dummyCharacter = {
      ...conversation.character,
      systemPrompt: narratorPrompt,
      personality: '',
      greeting: ''
    };

    const promptText = `Berikut adalah percakapan roleplay yang harus diringkas:\n\n${conversationText}`;

    const payload = {
      character: dummyCharacter,
      persona: {}, // Clear user persona so AI doesn't get confused
      memories: [],
      history: [],
      newMessage: promptText,
      apiSettings: apiSettings || {}
    };

    let childProcess;
    if (apiSettings && apiSettings.aiEngine === '9router') {
      const ninerouterScript = path.join(__dirname, 'ninerouter_proxy.js');
      childProcess = spawn('node', [ninerouterScript]);
    } else if (apiSettings && apiSettings.aiEngine === 'copilot') {
      const copilotScript = path.join(__dirname, 'copilot_proxy.js');
      childProcess = spawn('node', [copilotScript]);
    } else if (apiSettings && apiSettings.aiEngine === 'gravity') {
      const gravityScript = path.join(__dirname, 'gravity_proxy.js');
      childProcess = spawn('node', [gravityScript]);
    } else {
      let scriptName = 'council_ai.py';
      if (apiSettings && apiSettings.aiEngine === 'proxy') {
        scriptName = 'proxy_ai.py';
      }
      const pythonScript = path.join(__dirname, scriptName);
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3.11';
      childProcess = spawn(pythonCommand, [pythonScript]);
    }

    let aiFullResponse = '';
    
    childProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (let line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line.trim());
            if (parsed.type === 'text') {
              aiFullResponse += parsed.content;
            }
          } catch (e) {
            aiFullResponse += line + '\n';
          }
        }
      }
    });

    childProcess.on('close', async () => {
      if (aiFullResponse.trim()) {
        // Save to scenarios
        await prisma.scenario.create({
          data: {
            text: aiFullResponse.trim(),
            conversationId: conversation.id
          }
        });
        res.json({ success: true, summary: aiFullResponse.trim() });
      } else {
        res.status(500).json({ error: "Failed to generate summary (empty response)" });
      }
    });

    childProcess.on('error', (err) => {
      console.error("Failed to start child process:", err);
      res.status(500).json({ error: "AI Engine failed to start" });
    });

    childProcess.stdin.write(JSON.stringify(payload));
    childProcess.stdin.end();

  } catch (error) {
    console.error("Summarize error:", error);
    res.status(500).json({ error: "Failed to summarize chat" });
  }
});

// ==========================================
// SIDE CHARACTERS (NPC) ROUTES
// ==========================================

// Get NPCs for a character
app.get('/api/characters/:characterId/npcs', async (req, res) => {
  try {
    const npcs = await prisma.npc.findMany({
      where: { characterId: req.params.characterId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(npcs);
  } catch (error) {
    console.error("Error fetching NPCs:", error);
    res.status(500).json({ error: "Failed to fetch NPCs" });
  }
});

// Update NPCs for a character (Bulk replace)
app.put('/api/characters/:characterId/npcs', async (req, res) => {
  try {
    const { npcs } = req.body;
    const characterId = req.params.characterId;

    await prisma.$transaction(async (prisma) => {
      await prisma.npc.deleteMany({
        where: { characterId }
      });

      if (npcs && npcs.length > 0) {
        await prisma.npc.createMany({
          data: npcs.map(n => ({
            text: n.text,
            characterId
          }))
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving NPCs:", error);
    res.status(500).json({ error: "Failed to save NPCs" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend Server running on http://localhost:${port}`);
});
// Nodemon trigger restart
