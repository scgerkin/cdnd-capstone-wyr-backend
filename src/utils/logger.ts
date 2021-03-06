import {
  APIGatewayAuthorizerEvent,
  APIGatewayProxyEvent,
  Context,
  DynamoDBStreamEvent,
} from "aws-lambda"
import * as winston from "winston"
import {Logger} from "winston"

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

/**
 * FIXME this might be better as a class
 */

export function logStart(logger: winston.Logger, funcName, args?) {
  logger.log("info", `Initiate ${funcName}.`, {args: args})
}

export function logRepoParameters(logger: winston.Logger, parameters) {
  logger.log("info", "Parameters created.", {parameters: parameters})
}

export function logRepoResult(logger: winston.Logger, result) {
  logger.log("info", "Result received.", {result: result})
}

export const initiateLambda = (logger: Logger, event: APIGatewayProxyEvent | DynamoDBStreamEvent | APIGatewayAuthorizerEvent, context: Context) => {
  logger.log(
      "info",
      "Begin Lambda",
      {
        event: event,
        context: context,
      })
}
