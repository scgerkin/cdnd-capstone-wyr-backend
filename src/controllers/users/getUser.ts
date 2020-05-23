import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {User} from "../../models/User"
import {getUserById} from "../../services/UserService"
import {createLogger} from "../../utils/logger"
import {badRequest, requestSuccess} from "../shared"
import {initiateLambda} from "../utils"

const logger = createLogger("getUser")

/**
 * add-doc
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      const userId = event.pathParameters.userId
      if (!userId) {
        logger.error("Missing userId", {pathParameters: event.pathParameters})
        return badRequest("User ID is required.", {pathParameters: event.pathParameters})
      }
      logger.debug("Retrieved userId", {userId: userId})

      try {
        const user: User = await getUserById(userId)
        logger.info("Retrieved user", {user: user})
        return requestSuccess(user)
      } catch (e) {
        logger.error(e.message)
        return badRequest("Unable to retrieve user with that ID.", {userId: userId})
      }
    }
