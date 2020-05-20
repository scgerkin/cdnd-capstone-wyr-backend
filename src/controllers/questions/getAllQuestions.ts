import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
//import {Question} from "../../models/Question"
import {getAllQuestions} from "../../services/QuestionService"
import {createLogger} from "../../utils/logger"
import {internalError, requestSuccess} from "../shared"
import {initiateLambda} from "../utils"

const logger = createLogger("getAllQuestions")

/**
 * nts this needs to take a date range, paginated
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      try {
        const questions = await getAllQuestions()
        return requestSuccess(questions)
      } catch (e) {
        logger.error(e)
        return internalError(e)
      }

    }
