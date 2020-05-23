import {v4 as uuidv4} from 'uuid';
import {getYearMonthDateString} from "../controllers/utils"
import {DateRecordRequest, Question, QuestionDateRecord} from "../models/Question"
import {getDateRecordCount} from "../repositories/QuestionRepository"
import * as repo from "../repositories/QuestionRepository"
import {CreateQuestionRequest} from "../requests/CreateQuestionRequest"
import {CastVoteRequest} from "../requests/CastVoteRequest"
import {createLogger} from "../utils/logger"

const logger = createLogger("QuestionService");

/**
 * Creates a new Question from a CreateQuestionRequest and returns the result
 * after it has been persisted.
 * @param request A request containing the Question information.
 * @return Created Question
 */
export async function addNewQuestion(request: CreateQuestionRequest): Promise<Question> {
  logger.debug(
      "addNewQuestion initiated.",
      {
        createQuestionRequest: request,
        authorId: request.userId,
      })

  const question: Question = {
    questionId: uuidv4(),
    authorId: request.userId,
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
    await repo.putQuestion(question);
  } catch (e) {
    logger.error(e.message)
    throw e
  }

  return question
}

/**
 * Gets a Question record from the database by the questionId.
 * @param questionId The questionId of the record to retrieve.
 * @returns a Question object retrieved from the database.
 */
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
    logger.error(e.message)
    //todo sanitize, also should be a 400 on controller, but below will be 401
    throw e
  }
}

/**
 * Removes a Question record from the database.
 * @param questionId The questionId of the record to remove.
 * @param userId The userId of the requesting user.
 * @throws Error if the requesting userId does not match the authorId of the question.
 * @returns The questionId if deletion was successful.
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
    logger.error(e.message)
    // todo handle/sanitize
    throw e
  }
}

/**
 * Gets a list of Question records from the database created by a specific author.
 * @param authorId The author for which to retrieve records.
 * @returns A list of Question records created by the author.
 */
export async function getQuestionsByAuthor(authorId: string): Promise<Question[]> {
  return await repo.queryByAuthorId(authorId)
}

/**
 * add-doc
 *  Note: The results received from the batch is NOT ordered based on the request
 *  So even though we get a list of IDs to use for batching in descending order,
 *  the results will not be ordered the same way.
 * TODO return lastEvaluatedKey if exists
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

/**
 * add-doc
 * @param request
 */
export async function addVoteToQuestion(request: CastVoteRequest): Promise<Question> {
  let question = await getQuestionById(request.questionId)

  question = removeExistingVote(question, request.userId)

  //fixme this can probably be simplified to use 'question[request.option]: ...'
  if (request.option.toLowerCase().trim() === "optionone") {
    question = {
      ...question,
      optionOne: {
        ...question.optionOne,
        votes: question.optionOne.votes.concat([request.userId])
      }
    }
  } else if (request.option.toLowerCase().trim() === "optiontwo") {
    question = {
      ...question,
      optionTwo: {
        ...question.optionTwo,
        votes: question.optionTwo.votes.concat([request.userId])
      }
    }
  } else {
    throw new Error(JSON.stringify({
      message: "The option text was not matched to an existing option.",
      expected: "'optionOne' or 'optionTwo'",
      received: request.option
    }))
  }

  return await repo.putQuestion(question)
}

function removeExistingVote(question: Question, userId: string): Question {
  if (question.optionOne.votes.includes(userId)) {
    question = {
      ...question,
      optionOne: {
        ...question.optionOne,
        votes: question.optionOne.votes.filter(vote => vote !== userId),
      },
    }
  } else if (question.optionTwo.votes.includes(userId)) {
    question = {
      ...question,
      optionTwo: {
        ...question.optionTwo,
        votes: question.optionTwo.votes.filter(vote => vote !== userId),
      },
    }
  }
  return question;
}

/**
 * Takes a string containing a valid, parsable date, decrements the day by 1,
 * and returns the result in the form 'YYYY-MM-DD' as used by the question date
 * table for partition hash key
 * @param date The date to decrement
 */
function decrementDate(date: string): string {
  return getYearMonthDateString(new Date(date).getTime() - 86400000)
}
