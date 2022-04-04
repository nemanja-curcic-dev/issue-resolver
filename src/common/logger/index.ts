import winston from 'winston';

export default class Logger {
    public static getLogger(label: string): winston.Logger {
        if (!winston.loggers.has(label)) {
            winston.loggers.add(label, {
                transports: [Logger.consoleTransport],
                format: winston.format.label({ label }),
            });
        }
        return winston.loggers.get(label);
    }

    private static logFormatTemplate(i: {
        level: string;
        message: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    }): string {
        return `${i.timestamp} ${i.level} [${i.label}] ${i.message}`;
    }

    private static readonly consoleTransport = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.cli(),
            winston.format.printf(Logger.logFormatTemplate)
        ),
    });
}
