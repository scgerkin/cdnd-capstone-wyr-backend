import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {Question} from "../../models/Question"

import {createLogger} from "../../utils/logger"
import {badRequest} from "../shared"
import {initiateLambda} from "../utils"

const logger = createLogger("updateQuestion")

/**
 * add-doc
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      let question: Question
      try {
        question = JSON.parse(event.body)
      } catch (e) {
        return badRequest("Unable to parse request.",
            {request: event.body, error: e.message})
      }

    }
