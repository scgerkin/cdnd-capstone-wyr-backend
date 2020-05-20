import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {deleteQuestion} from "../../services/QuestionService"
import {createLogger} from "../../utils/logger"
import {badRequest, requestSuccess, invalidUserId} from "../shared"
import {getUserId, initiateLambda} from "../utils"

const logger = createLogger("deleteQuestion")

/**
 * add-doc
 * @param event
 * @param context
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
