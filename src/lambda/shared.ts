import {APIGatewayProxyResult} from "aws-lambda"

export function invalidUserId(): APIGatewayProxyResult {
  return {
    statusCode: 401,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({error: "userId could not be retrieved from Authorization JWT."}),
  }
}

//fixme make sure everything is returning a list, even if only one item
export function requestSuccess(payload: any, statusCode?: number): APIGatewayProxyResult {
  return {
    statusCode: statusCode ? statusCode : 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({payload: payload}),
  }
}

export function badRequest(errorMsg: string, request: any, statusCode?: number): APIGatewayProxyResult {
  return {
    statusCode: statusCode ? statusCode : 400,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({error: errorMsg, request: request}),
  }
}

export function internalError(error: Error): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({message: "Error processing request.", error: error}),
  }
}
