import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";
const logLevel = isProduction ? "info" : "debug";

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports: winston.transport[] = [];

if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    })
  );

  transports.push(
    new winston.transports.Console({
      format: fileFormat,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: logLevel,
  transports,
  exitOnError: false,
});

export function logError(
  error: Error,
  context?: Record<string, unknown>
): void {
  logger.error(error.message, {
    name: error.name,
    stack: isProduction ? undefined : error.stack,
    ...context,
  });
}

export function logRequest(req: {
  method: string;
  path: string;
  ip?: string;
}): void {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
  });
}
