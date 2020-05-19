import {APIGatewayProxyResult} from "aws-lambda"

export default function invalidUserId(): APIGatewayProxyResult {
  return {
    statusCode: 401,
    body: JSON.stringify({error: "userId could not be retrieved from Authorization JWT."})
  }
}
