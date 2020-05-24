import {APIGatewayTokenAuthorizerEvent, Context, CustomAuthorizerResult} from 'aws-lambda'
import Axios from 'axios'
import {Algorithm, decode, verify} from 'jsonwebtoken'
import {Jwk} from "../../models/Jwk"
import {Jwt, JwtPayload} from "../../models/Jwt"
import {addCertWrapper} from "../../utils/auth"
import {createLogger, initiateLambda} from "../../utils/logger"

const logger = createLogger("auth0Authorizer")

const jwksUrl = 'https://scgrk-dev.auth0.com/.well-known/jwks.json';
// cached for subsequent calls, use getJwkList()
let jwkList: Jwk[]

export const handler = async (event: APIGatewayTokenAuthorizerEvent, context: Context):
    Promise<CustomAuthorizerResult> => {
  initiateLambda(logger, event, context)

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info("User authorized.", {token: jwtToken})

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    }
  } catch (e) {
    logger.error("Unable to authorize user.")
    logger.error(e.message)
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, {complete: true}) as Jwt
  const jwk: Jwk = await getJwkList()
      .then(jwks => jwks.reduce(key => {
        if (key.kid === jwt.header.kid) {
          return key
        }
      }))

  if (!jwk) {
    logger.error("Invalid signing key. Matching JWK not found.",
        {
          jwkList: jwkList,
          jwt: jwt, kid:
          jwt.header.kid,
        })
    throw new Error("Invalid signing key. Matching JWK not found.")
  }

  const cert = addCertWrapper(jwk.x5c[0])

  return verify(token, cert, {algorithms: [jwk.alg as Algorithm]}) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header');
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header');
  }

  const split = authHeader.split(' ');
  return split[1];
}

/**
 * Using this as a wrapper around the jwkList allows caching the results for
 * subsequent calls while the Lambda is still active
 */
async function getJwkList(): Promise<Jwk[]> {
  if (!jwkList) {
    const response = await Axios.get(jwksUrl);
    jwkList = response.data.keys as Jwk[]
  }

  return jwkList
}
