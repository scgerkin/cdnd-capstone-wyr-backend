import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {Question} from "../../models/Question"
import {getQuestionById} from "../../services/QuestionService"
import {createLogger} from "../../utils/logger"
import {badRequest, requestSuccess} from "../shared"
import {initiateLambda} from "../utils"

const logger = createLogger("getQuestionById")

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

      try {
        const question: Question = await getQuestionById(questionId)
        logger.log("info", "Retrieved question", {question: question})
        return requestSuccess(question)
      } catch (e) {
        logger.error(e.message)
        return badRequest("Unable to retrieve question with that ID.",
            {
              questionId: questionId,
              error: e.message
            })
      }
    }
