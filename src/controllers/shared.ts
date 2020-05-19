import {APIGatewayProxyResult} from "aws-lambda"

export function invalidUserId(): APIGatewayProxyResult {
  return {
    statusCode: 401,
    body: JSON.stringify({error: "userId could not be retrieved from Authorization JWT."})
  }
}

export function createSuccess(payload: any): APIGatewayProxyResult {
  return {
    statusCode: 201,
    body: JSON.stringify({item: payload})
  }
}

export function badRequest(errorMsg: string, request: any): APIGatewayProxyResult {
  return {
    statusCode: 400,
    body: JSON.stringify({error: errorMsg, request: request})
  }
}

export function internalError(error: Error): APIGatewayProxyResult {
  return {
    statusCode: 500,
    body: JSON.stringify({message: "Error processing request.", error: error})
  }
}
