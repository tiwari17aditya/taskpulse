import fs from 'fs';
import path from 'path';

const TOKEN_FILE_PATH = path.join(process.cwd(), 'token_usage.md');

export function readTokenUsage() {
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      return fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
    }
    return '';
  } catch (err) {
    console.error('Error reading token usage:', err);
    return '';
  }
}

export function appendTokenUsage({ date, sessionId, inputTokens, outputTokens, totalTokens, estimatedCost, notes }) {
  try {
    const today = date || new Date().toISOString().split('T')[0];
    const session = sessionId || 'Session-' + Math.random().toString(36).substr(2, 6);
    const inT = inputTokens !== undefined ? inputTokens : '--';
    const outT = outputTokens !== undefined ? outputTokens : '--';
    const totT = totalTokens !== undefined ? totalTokens : (typeof inT === 'number' && typeof outT === 'number' ? inT + outT : '--');
    const cost = estimatedCost !== undefined ? `$${Number(estimatedCost).toFixed(4)}` : '$0.0000';
    const noteStr = notes || 'Task Execution';

    const row = `| ${today} | ${session} | ${inT} | ${outT} | ${totT} | ${cost} | ${noteStr} |\n`;

    if (!fs.existsSync(TOKEN_FILE_PATH)) {
      const header = `# Daily Token Usage Tracker\n\n| Date | Session / Chat ID | Input Tokens | Output Tokens | Total Tokens | Estimated Cost ($) | Status / Notes |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      fs.writeFileSync(TOKEN_FILE_PATH, header + row, 'utf8');
    } else {
      fs.appendFileSync(TOKEN_FILE_PATH, row, 'utf8');
    }
    return true;
  } catch (err) {
    console.error('Error updating token usage:', err);
    return false;
  }
}
