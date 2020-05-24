import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {getUserId} from "../../utils/auth"
import {createLogger, initiateLambda} from "../../utils/logger";
import {invalidUserId} from "../shared"

const logger = createLogger("addNewQuestion")

/**
 * Handles POST requests for adding a new Question to the database.
 * @method POST
 * @param event The event with body containing a CreateQuestionRequest object.
 * @param context The current context.
 * @return APIGatewayProxyResult with the created question.
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





}
