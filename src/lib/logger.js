import fs from 'fs';
import path from 'path';

export function getTodayLogFileName() {
  const today = new Date().toISOString().split('T')[0];
  return `log_${today}.log`;
}

export function writeLog(level, message) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const logsDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFile = path.join(logsDir, `log_${todayStr}.log`);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (err) {
    console.error('Failed to write system log:', err);
  }
}

export function readLog(dateStr) {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `log_${targetDate}.log`);

    if (fs.existsSync(logFile)) {
      return fs.readFileSync(logFile, 'utf8');
    }
    return `[System] No log file found for date: ${targetDate}`;
  } catch (err) {
    return `[Error] Failed to read log file: ${err.message}`;
  }
}
