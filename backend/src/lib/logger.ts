import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const logLevel = isTest ? "silent" : isProduction ? "info" : "debug";

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length) {
      // Function to stringify objects with BigInt support
      const stringifyWithBigInt = (obj: Record<string, unknown>) => {
        return JSON.stringify(
          obj,
          (_, value) => (typeof value === "bigint" ? value.toString() : value),
          2 // 2 spaces indentation
        );
      };

      // Separate stack trace from other metadata
      const { stack, ...otherMeta } = meta;

      // Add metadata on a new line with indentation
      if (Object.keys(otherMeta).length) {
        msg += `\n  📋 ${stringifyWithBigInt(otherMeta)
          .split("\n")
          .join("\n  ")}`;
      }

      // Added stack trace on a new line if it exists
      if (stack && typeof stack === "string") {
        msg += `\n  🔍 Stack trace:\n    ${stack.split("\n").join("\n    ")}`;
      }
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
