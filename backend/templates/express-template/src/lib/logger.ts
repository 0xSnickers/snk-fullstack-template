import pino from 'pino';
import { env } from '../config/env.js';

/** JSON logs to stdout, and also to LOG_FILE when set. */
const streams: pino.StreamEntry[] = [{ stream: process.stdout }];
if (env.LOG_FILE) {
  streams.push({ stream: pino.destination({ dest: env.LOG_FILE, mkdir: true, sync: false }) });
}

export const logger = pino({ level: env.LOG_LEVEL }, pino.multistream(streams));
