import {APIGatewayProxyEvent} from "aws-lambda"

export function getUserId(event: APIGatewayProxyEvent) {
  // todo remove console log after implementation
  //  only here to make the compiler happy
  console.log(event)
  return "fakeUser"
}

export function addCertWrapper(cert: string): string {
  return "-----BEGIN CERTIFICATE-----\n"+cert+"\n-----END CERTIFICATE-----";
}
