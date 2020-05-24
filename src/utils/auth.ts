import {APIGatewayProxyEvent} from "aws-lambda"
import {decode} from "jsonwebtoken"

import {JwtPayload} from "../models/Jwt"

export function getUserId(event: APIGatewayProxyEvent, logger) {
  const jwt = extractJwt(event)
  return parseUserId(jwt, logger)

}

export function addCertWrapper(cert: string): string {
  return "-----BEGIN CERTIFICATE-----\n"+cert+"\n-----END CERTIFICATE-----";
}

export function extractJwt(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization;

  const authParts = authorization.split(' ');

  if (authParts[0].toLowerCase() !== "bearer") {
    throw new Error("Invalid authorization header, missing \'Bearer\'");
  }

  const token = authParts[1];

  if (!token) {
    throw new Error("Invalid or missing JWT.");
  }

  return token;
}

export function parseUserId(jwtToken: string, logger): string {
  try {
    const decodedToken = decode(jwtToken) as JwtPayload
    return decodedToken.sub.split("|")[1]
  } catch (e) {
    logger.error("Unable to parse JWT as payload.", {
      message: e.message,
      jwtToken: jwtToken
    })
    throw e
  }
}
