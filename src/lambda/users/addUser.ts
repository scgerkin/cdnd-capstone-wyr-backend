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


      return null


    }
