import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {User} from "../../models/User"
import {getUserById, updateUser} from "../../services/UserService"
import {getUserId} from "../../utils/auth"

import {createLogger, initiateLambda} from "../../utils/logger"
import {badRequest, internalError, invalidUserId, requestSuccess} from "../shared"

const logger = createLogger("updateUser")

/**
 * add-doc
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context):
    Promise<APIGatewayProxyResult> => {
  initiateLambda(logger, event, context)

  let userId: string;
  try {
    userId = getUserId(event, logger)
    logger.log("info", "Retrieved userId", {userId: userId})
  } catch (e) {
    logger.error(e.message)
    return invalidUserId()
  }

  let updated: {name: string}
  try {
    updated = JSON.parse(event.body)
  } catch (e) {
    logger.error(e.message)
    return badRequest(e.message, {request: event.body})
  }

  let user: User
  try {
    user = await getUserById(userId)
    user.name = updated.name
    const updatedUser = await updateUser(user)
    return requestSuccess(updatedUser)
  } catch (e) {
    logger.error(e.message)
    return internalError(e.message)
  }
}
