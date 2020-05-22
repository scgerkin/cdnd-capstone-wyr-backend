import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {DateRecordRequest} from "../../models/Question"
import {MAX_QUERY_LIMIT} from "../../repositories/QuestionRepository"
import {getQuestionsByDate} from "../../services/QuestionService"
import {createLogger} from "../../utils/logger"
import {badRequest, internalError, requestSuccess} from "../shared"
import {getYearMonthDateString, initiateLambda} from "../utils"

const logger = createLogger("getAllQuestions")
const DATE_REGEX = new RegExp("^(19|20)\\d{2}[\\-](0[1-9]|1[0-2])[\\-](0[1-9]|[12]\\d|3[01])$")

/**
 * add-doc
 * todo need to return last evaluated key if present
 * todo bounce requests before oldest date
 *  It should be bounced by the service, however that will still make an unnecessary
 *  query that can be avoided by validating before calling it
 * @param event
 * @param context
 */
export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      initiateLambda(logger, event, context)

      let request: DateRecordRequest
      if (!!event.queryStringParameters) {
        try {
          request = parseQueryStringParams(event.queryStringParameters)
        } catch (e) {
          return badRequest(e.message, event.queryStringParameters)
        }
      } else {
        request = defaultRequest()
      }


      try {
        const questions = await getQuestionsByDate(request)
        return requestSuccess(questions)
      } catch (e) {
        return internalError(e)
      }
    }

function defaultRequest() {
  return {
    questionCreateDate: getYearMonthDateString(Date.now()),
    limit: MAX_QUERY_LIMIT
  }
}

// todo validation could use some improvement
//  None of these are actually required, so defaults need to be set if they are
//  not present
//  questionCreateDate needs to be in the form "YYYY-MM-DD" and createdAt needs
//  to be a Unix timestamp in mills
function parseQueryStringParams(parameters): DateRecordRequest {
  return {
    questionCreateDate: setQuestionCreateDate(parameters),
    limit: setLimit(parameters.limit),
    lastEvaluatedKey: setLastEvaluatedKey(parameters)
  }
}

function setQuestionCreateDate(parameters): string {
  if (!parameters.date) {
    return getYearMonthDateString(Date.now())
  } else if (validDateString(parameters.yearMonthDay)) {
    return parameters.yearMonthDay
  } else {
    throw new Error("Invalid yearMonthDay. Must be in the form 'YYYY-MM-DD.")
  }
}

function setLimit(limit?: string): number {
  if (!limit || Number(limit) > MAX_QUERY_LIMIT) {
    return MAX_QUERY_LIMIT
  } else {
    return Number(limit)
  }
}

// todo validate createdAt
function setLastEvaluatedKey(parameters): {questionCreateDate: string, createdAt: number} {
  if (!parameters.lastEvaluatedKey || parameters.lastEvaluatedKey === false) {
    return null
  }
  if (!parameters.questionCreateDate || !parameters.createdAt) {
    throw new Error("Invalid query parameters. " +
        "questionCreateDate and createdAt are required when using lastEvaluatedKey.")
  }
  if (!validDateString(parameters.questionCreateDate)) {
    throw new Error("Invalid lastEvaluatedKey." +
        " questionCreateDate must be in the form 'YYYY-MM-DD.")
  }
  return {
    questionCreateDate: parameters.questionCreateDate,
    createdAt: Number(parameters.createdAt)
  }
}

//todo move this into utils
function validDateString(dateString: string) {
  return DATE_REGEX.test(dateString)
}
