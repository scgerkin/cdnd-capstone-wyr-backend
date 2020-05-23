import {APIGatewayProxyEvent} from "aws-lambda"

export function getUserId(event: APIGatewayProxyEvent) {
  // todo remove console log after implementation
  //  only here to make the compiler happy
  console.log(event)
  return "fakeUser"
}
