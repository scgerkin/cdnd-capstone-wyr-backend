import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {Question} from "../../models/Question"
import {getQuestionsByAuthor} from "../../services/QuestionService"
import {createLogger} from "../../utils/logger"
import {badRequest, requestSuccess} from "../shared"
import {initiateLambda} from "../utils"

const logger = createLogger("getQuestionById")

export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      const authorId = event.pathParameters.authorId
      if (!authorId) {
        logger.error("Missing userId", {pathParameters: event.pathParameters})
        return badRequest("User ID is required.", {pathParameters: event.pathParameters})
      }
      logger.log("info", "Retrieved userId", {authorId: authorId})

      try {
        const question: Question[] = await getQuestionsByAuthor(authorId)
        logger.log("info", "Retrieved question", {question: question})
        return requestSuccess(question)
      } catch (e) {
        logger.error(e)
        return badRequest("Unable to retrieve questions with that ID.",
            {
              authorId: authorId,
              error: e
            })
      }
    }

