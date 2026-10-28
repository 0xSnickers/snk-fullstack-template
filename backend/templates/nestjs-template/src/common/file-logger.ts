import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const LEVELS: Record<string, LogLevel[]> = {
  debug: ['debug', 'log', 'warn', 'error', 'fatal'],
  info: ['log', 'warn', 'error', 'fatal'],
  warn: ['warn', 'error', 'fatal'],
  error: ['error', 'fatal'],
};

/** Nest console logger that also appends JSON lines to LOG_FILE. */
export class FileLogger extends ConsoleLogger {
  constructor(
    level: string,
    private readonly file: string,
  ) {
    super({ logLevels: LEVELS[level] ?? LEVELS.info });
    if (file) mkdirSync(dirname(file), { recursive: true });
  }

  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    super.printMessages(messages, context, logLevel, writeStreamType);
    if (!this.file) return;
    const line = {
      time: new Date().toISOString(),
      level: logLevel,
      context,
      msg: messages.map(String).join(' '),
    };
    appendFileSync(this.file, `${JSON.stringify(line)}\n`);
  }
}
