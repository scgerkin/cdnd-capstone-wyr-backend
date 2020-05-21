import {v4 as uuidv4} from 'uuid';
import {getYearMonthDateString} from "../controllers/utils"
import {DateRecordRequest, Question, QuestionDateRecord} from "../models/Question"
import {getDateRecordCount} from "../repositories/QuestionRepository"
import * as repo from "../repositories/QuestionRepository"
import {CreateQuestionRequest} from "../requests/Question"
import {createLogger} from "../utils/logger"

const logger = createLogger("QuestionService");

/**
 * Creates a new Question from a CreateQuestionRequest and returns the result
 * after it has been persisted.
 * @param request A request containing the Question information.
 * @param authorId The ID of the user creating the new Question.
 * @return Created Question
 */
export async function addNewQuestion(request: CreateQuestionRequest, authorId: string): Promise<Question> {
  logger.debug(
      "addNewQuestion initiated.",
      {
        createQuestionRequest: request,
        authorId: authorId,
      })

  const question: Question = {
    questionId: uuidv4(),
    authorId: authorId,
    createdAt: Date.now(),
    optionOne: {
      text: request.optionOneText,
      votes: [],
    },
    optionTwo: {
      text: request.optionTwoText,
      votes: [],
    },
  }
  logger.info("Created new question.", {question: question})

  try {
    await repo.putNewQuestion(question);
  } catch (e) {
    logger.error(e)
    throw e
  }

  return question
}

export async function getQuestionById(questionId: string): Promise<Question> {
  logger.debug(
      "deleteQuestion initiated.",
      {
        questionId: questionId,
      })

  try {
    return await repo.queryByQuestionId(questionId)
  } catch (e) {
    logger.error("Unable to retrieve question.", {questionId: questionId})
    logger.error(e)
    //todo sanitize, also should be a 400 on controller, but below will be 401
    throw e
  }
}

/**
 * add-doc
 * @param questionId
 * @param userId
 */
export async function deleteQuestion(questionId: string, userId: string): Promise<any> {
  logger.debug(
      "deleteQuestion initiated.",
      {
        questionId: questionId,
        userId: userId,
      })

  const question: Question = await getQuestionById(questionId)

  if (question.authorId !== userId) {
    throw new Error("Question does not belong to the requesting user.")
  }

  try {
    await repo.deleteQuestion(question)
    return questionId
  } catch (e) {
    logger.error("Unable to delete question.", {question: question})
    logger.error(e)
    // todo handle/sanitize
    throw e
  }
}

/**
 * add-doc
 * @param authorId
 */
export async function getQuestionsByAuthor(authorId: string): Promise<Question[]> {
  return await repo.queryByAuthorId(authorId)
}

/**
 * add-doc
 *  Note: The results received from the batch is NOT ordered based on the request
 *  So even though we get a list of IDs to use for batching in descending order,
 *  the results will not be ordered the same way.
 * Consider sorting here, although that may not be needed. The front end sorts
 *  when it displays stuff
 *  FIXME This needs to increment by 1 day if not enough results found
 */
export async function getQuestionsByDate(request: DateRecordRequest): Promise<any> {
  let dateRecords: QuestionDateRecord[] = await repo.getDateRecords(request)

  //fixme there is probably a better solution (besides `scan`)
  if (dateRecords.length < request.limit) {
    const itemCount = await getDateRecordCount()
    while (dateRecords.length < request.limit && dateRecords.length !== itemCount) {
      //note could create infinite loop, so we have to stop at an arbitrary point
      // in time. Theoretically this would be the table creation date, but some
      // dummy records are older than the table creation date
      // so this is here to stop before going past that point
      // this is one area where the ability to `scan` would be helpful, but due
      // to project requirements, this cannot be done.
      if (new Date(request.questionCreateDate) < new Date("2020-05-18")) {
        break;
      }
      request = {
        ...request,
        limit: request.limit - dateRecords.length,
        questionCreateDate: decrementDate(request.questionCreateDate)
      }
      const recordsToAppend = await repo.getDateRecords(request)
      dateRecords = dateRecords.concat(recordsToAppend)
    }
  }

  // consists of createdAt and authorId which is what we need to use as keys
  // for batch get
  const questionPartitionKey = dateRecords.map(record => {
    delete record.questionCreateDate
    delete record.questionId
    return record
  })

  return await repo.batchGetQuestions(questionPartitionKey)
}

function decrementDate(date: string): string {
  return getYearMonthDateString(new Date(date).getTime() - 86400000)

}
