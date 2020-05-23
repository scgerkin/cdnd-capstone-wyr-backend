import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {deleteQuestion} from "../../services/QuestionService"
import {getUserId} from "../../utils/auth"
import {createLogger, initiateLambda} from "../../utils/logger"
import {badRequest, requestSuccess, invalidUserId} from "../shared"

const logger = createLogger("deleteQuestion")

/**
 * Deletes a question from the database by questionId if the question was created
 * by the current requesting user.
 * @param event The current event containing path parameters for the question id.
 * @param context The current context.
 * @return APIGatewayProxyResult with the deleted questionId.
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      const questionId = event.pathParameters.questionId
      if (!questionId) {
        logger.error("Missing questionId", {pathParameters: event.pathParameters})
        return badRequest("Question ID is required.", {pathParameters: event.pathParameters})
      }
      logger.log("info", "Retrieved questionId", {questionId: questionId})

      let userId: string;
      try {
        userId = getUserId(event)
        logger.log("info", "Retrieved userId", {userId: userId})
      } catch (e) {
        logger.error(e)
        return invalidUserId()
      }

      try {
        await deleteQuestion(questionId, userId)
        return requestSuccess(questionId, 202)
      } catch (e) {
        return badRequest(e, {questionId: questionId, userId: userId}, 403)
      }
    }
