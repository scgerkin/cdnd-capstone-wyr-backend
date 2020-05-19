import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {Question} from "../../models/Question"
import {CreateQuestionRequest} from "../../requests/Question"
import {addNewQuestion} from "../../services/QuestionService"
import {createLogger} from "../../utils/logger";
import {badRequest, createSuccess, internalError} from "../shared"
import {invalidUserId} from "../shared"
import {getUserId, initiateLambda} from "../utils"

const logger = createLogger("postNewQuestions")

export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      let userId: string;
      try {
        userId = getUserId(event)
        logger.log("info", "Retrieved userId", {userId: userId})
      } catch (e) {
        logger.error(e)
        return invalidUserId()
      }

      const request: CreateQuestionRequest = JSON.parse(event.body)

      if (!validCreateRequest(request)) {
        return badRequest("Invalid create request." +
            "Option text cannot be null and must be at least 5 characters.", request)
      }

      try {
        const question: Question = await addNewQuestion(request, userId)
        return createSuccess(question)
      } catch (e) {
        return internalError(e)
      }
    }

/**
 * Validates that a Question.ts contains valid information.
 * Fixme: Validation is very rudimentary.
 * @param request The request to validate.
 * @returns True if all required checks pass.
 */
function validCreateRequest(request: CreateQuestionRequest): Boolean {
  return request.optionOneText.length >= 5 && request.optionTwoText.length >= 5
}
