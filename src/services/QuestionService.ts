import {v4 as uuidv4} from 'uuid';
import {Question} from "../models/Question"
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
    createdAt: new Date().toISOString(),
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
