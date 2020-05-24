import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {CastVoteRequest} from "../../requests/CastVoteRequest"
import {addVoteToQuestion} from "../../services/QuestionService"
import {getUserId} from "../../utils/auth"

import {createLogger, initiateLambda} from "../../utils/logger"
import {badRequest, invalidUserId, requestSuccess} from "../shared"

const logger = createLogger("updateQuestion")

/**
 * add-doc
 * FIXME To be consistent with how User information is stored, this should receive
 *  'optionOne' or 'optionTwo' instead of the option text. This will also allow for
 *  changing the interface without changing the data to support editing options if
 *  desired. It's unlikely that we would allow someone to change the options for
 *  a question without completely nullifying the results, but having the option
 *  to change things easier in the future is better overall.
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      let userId: string;
      try {
        userId = getUserId(event, logger)
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
      if (!castVoteRequest.option) {
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
