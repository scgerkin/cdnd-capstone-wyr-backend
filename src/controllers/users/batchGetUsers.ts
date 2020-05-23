import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {User} from "../../models/User"
import {getUsers} from "../../services/UserService"
import {createLogger} from "../../utils/logger"
import {badRequest, requestSuccess} from "../shared"
import {initiateLambda} from "../utils"

const logger = createLogger("batchGetUsers")

/**
 * add-doc
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      let request: {userIds: string[]}
      try {
        request = JSON.parse(event.body)
      } catch (e) {
        logger.error("Unable to parse request.")
        logger.error(e.message)
        return badRequest("Unable to parse request.",
            {request:event.body, error:e.message})
      }

      try {
        const users: User[] = await getUsers(request.userIds)
        logger.info("Retrieved users.", {users: users})
        return requestSuccess(users)
      } catch (e) {
        logger.error(e.message)
        return badRequest("Unable to retrieve those users.", {errorMsg: e.message})
      }
    }
