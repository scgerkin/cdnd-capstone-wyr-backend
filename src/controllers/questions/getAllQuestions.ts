import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
//import {Question} from "../../models/Question"
import {getQuestionsByDate} from "../../services/QuestionService"
import {createLogger} from "../../utils/logger"
import {internalError, requestSuccess} from "../shared"
import {initiateLambda} from "../utils"

const logger = createLogger("getAllQuestions")

export const RECENT_QUESTIONS_MAX_LIMIT = process.env.RECENT_QUESTIONS_MAX_LIMIT

/**
 * nts this needs to take a date range, pagination params, and limit from path query params
 *  if none, use defaults of now, no last key index, limit ?40
 *  Can return empty list if nothing found with those params
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      // const lastEvaluatedKey = event.pathParameters.lastEvaluatedKey
      //     ? event.pathParameters.lastEvaluatedKey
      //     : null
      //
      // const limit = event.pathParameters.limit < RECENT_QUESTIONS_MAX_LIMIT
      //   ? event.pathParameters.limit
      //   : RECENT_QUESTIONS_MAX_LIMIT
      // logger.debug("Request parameters", {lastEvaluatedKey: lastEvaluatedKey, limit: limit})

      // try {
      //   const questions = await getQuestionsByDate(lastEvaluatedKey, limit)
      //   return requestSuccess(questions)
      // } catch (e) {
      //   logger.error(e)
      //   return internalError(e)
      // }

      try {
        const dateRecords = await getQuestionsByDate({yearMonthDay: "2020-05-21", limit: 5})
        return requestSuccess(dateRecords)
      } catch (e) {
        return internalError(e)
      }


    }
