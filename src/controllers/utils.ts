import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {Logger} from "winston";

export const initiateLambda = (logger: Logger, event: APIGatewayProxyEvent, context: Context) => {
  logger.log(
      "info",
      "Begin Lambda",
      {
        event: JSON.stringify(event),
        context: JSON.stringify(context)
      })
}

export function getUserId(event: APIGatewayProxyEvent) {
  // todo remove console log after implementation
  //  only here to make the compiler happy
  console.log(event)
  return "fakeUser"
}
