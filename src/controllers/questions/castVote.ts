import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {CastVoteRequest} from "../../requests/Question"
import {addVoteToQuestion} from "../../services/QuestionService"

import {createLogger} from "../../utils/logger"
import {badRequest, invalidUserId, requestSuccess} from "../shared"
import {getUserId, initiateLambda} from "../utils"

const logger = createLogger("updateQuestion")

/**
 * add-doc
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      let userId: string;
      try {
        userId = getUserId(event)
        logger.log("info", "Retrieved userId", {userId: userId})
      } catch (e) {
        logger.error(e.message)
        return invalidUserId()
      }

      let castVoteRequest: CastVoteRequest
      try {
        castVoteRequest = JSON.parse(event.body)
      } catch (e) {
        logger.error(e.message)
        return badRequest("Unable to parse request.", {error: e.message, request: event.body})
      }

      if (!castVoteRequest.questionId) {
        return badRequest("Question ID is required.", {pathParameters: event.pathParameters})
      }
      if (!castVoteRequest.optionText) {
        return badRequest("Option text is required.", {request: castVoteRequest})
      }
      castVoteRequest = {
        ...castVoteRequest,
        userId: userId
      }

      try {
        const updatedQuestion = await addVoteToQuestion(castVoteRequest)
        return requestSuccess(updatedQuestion)
      } catch (e) {
        return badRequest("Unable to update record.",
            {request: castVoteRequest, message: JSON.parse(e.message)})
      }
    }
