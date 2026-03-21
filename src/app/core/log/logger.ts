import log4js from 'log4js';
import dotenv from 'dotenv';
dotenv.config();

const logToFile = process.env.LOG_TO_FILE === 'true';

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: 'logs/app.log' },
        everything: {
            type: 'logLevelFilter',
            appender: logToFile ? 'file' : 'console',
            level: 'debug',
        },
    },
    categories: {
        default: { appenders: ['everything'], level: 'debug' },
    },
});

export const logger = log4js.getLogger();
