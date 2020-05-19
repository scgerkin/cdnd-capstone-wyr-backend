import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {createLogger} from "../../utils/logger";
import invalidUserId from "../shared"
import {getUserId, initiateLambda} from "../utils";

const logger = createLogger("postNewQuestions")

export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      let userId: string;
      try {
        userId = getUserId(event)
        logger.log("info", "Retrieved userId", {userId: userId})
      } catch (e) {
        logger.error(e)
        return invalidUserId()
      }

      return null
    }

