/**
 * High-accuracy tokenizer estimator for Indonesian & English multilingual LLM text
 * (GPT-4, Claude 3.5, Gemini 1.5/2.0/3.x, DeepSeek, etc.)
 */

export function estimateTokens(text) {
  if (!text) return 0;
  if (typeof text !== 'string') text = String(text);
  if (text.length === 0) return 0;

  // Split on whitespace to get word count
  const words = text.trim().split(/\s+/).filter(Boolean);
  const charCount = text.length;

  // CJK characters count as 1.5 tokens on average
  const cjkMatches = text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // Newlines typically become separate tokens
  const newlineMatches = text.match(/\n/g);
  const newlineCount = newlineMatches ? newlineMatches.length : 0;

  // Latin characters count (Indonesian + English)
  const latinChars = Math.max(0, charCount - cjkCount);

  // Blend word-count (1.25 tok/word avg) and character-count (3.7 chars/tok avg for Indo-English)
  const wordTokens = words.length * 1.25;
  const charTokens = latinChars / 3.75;
  const cjkTokens = cjkCount * 1.5;

  const estimated = Math.round(
    (wordTokens * 0.35) + (charTokens * 0.65) + cjkTokens + (newlineCount * 0.4)
  );

  return Math.max(1, estimated);
}

/**
 * Formats token count to human-readable string (e.g., 1.2k, 850)
 */
export function formatTokens(count) {
  if (!count || count < 0) return '0';
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return count.toLocaleString('id-ID');
}

/**
 * Calculates a complete context token breakdown for the conversation
 */
export function calculateContextBreakdown({
  character,
  persona,
  memories = [],
  npcs = [],
  history = [],
  historyLimit = 30,
  roleplayTime = '',
  roleplayDate = '',
  draftMessage = ''
}) {
  // 1. System Prompt & Character Info
  let systemPromptText = character?.systemPrompt || '';
  if (character?.personality) {
    systemPromptText += `\n\nKarakter Persona:\n${character.personality}`;
  }
  if (character?.sampleDialog) {
    systemPromptText += `\n\nContoh Dialog:\n${character.sampleDialog}`;
  }
  if (character?.name) {
    systemPromptText += `\nYour character name is: ${character.name}`;
  }
  const characterTokens = estimateTokens(systemPromptText);

  // 2. Time & Date Context
  let timeText = '';
  if (roleplayTime || roleplayDate) {
    timeText = `[KONTEKS WAKTU & TANGGAL SAAT INI (PENTING!)]\n`;
    if (roleplayDate) timeText += `Tanggal Kejadian: ${roleplayDate}\n`;
    if (roleplayTime) timeText += `Waktu/Jam Saat Ini: ${roleplayTime}\n`;
  }
  const timeTokens = estimateTokens(timeText);

  // 3. User Persona
  let personaText = '';
  if (persona?.name) personaText += `Nama User: ${persona.name}\n`;
  if (persona?.description) personaText += `Deskripsi User:\n${persona.description}`;
  const personaTokens = estimateTokens(personaText);

  // 4. Memories & Lorebook
  const memoryText = (memories || [])
    .map(m => (typeof m === 'string' ? m : m.text))
    .filter(Boolean)
    .join('\n');
  const memoryTokens = estimateTokens(memoryText);

  // 5. NPCs
  const npcText = (npcs || [])
    .map(n => (typeof n === 'string' ? n : n.text))
    .filter(Boolean)
    .join('\n\n');
  const npcTokens = estimateTokens(npcText);

  // 6. Active Chat History (last N messages based on historyLimit)
  const limit = Math.min(Math.max(parseInt(historyLimit) || 30, 4), 100);
  // Take last `limit` messages
  const activeHistory = (history || []).slice(-limit);
  const historyText = activeHistory
    .map(m => `${m.role === 'ai' ? 'assistant' : 'user'}: ${m.content || ''}`)
    .join('\n\n');
  const historyTokens = estimateTokens(historyText);

  // 7. Current Draft Message in Input Textarea
  const draftTokens = draftMessage ? estimateTokens(draftMessage) : 0;

  // Total Input Tokens (all parts that will be sent to LLM API)
  const totalInputTokens =
    characterTokens +
    timeTokens +
    personaTokens +
    memoryTokens +
    npcTokens +
    historyTokens +
    draftTokens;

  return {
    characterTokens,
    timeTokens,
    personaTokens,
    memoryTokens,
    npcTokens,
    historyTokens,
    historyCount: activeHistory.length,
    draftTokens,
    totalInputTokens
  };
}
