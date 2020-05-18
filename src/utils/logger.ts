import * as winston from "winston";

export function createLogger(loggerName: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || "debug",
    format: winston.format.json(),
    defaultMeta: {name: loggerName},
    transports: [
      new winston.transports.Console()
    ]
  })
}
