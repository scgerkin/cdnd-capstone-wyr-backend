import {v4 as uuidv4} from 'uuid';
import * as repo from "../repositories/QuestionRepository"
import {Question} from "../models/Question"
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
    id: uuidv4(),
    authorId: authorId,
    createdAt: new Date().toISOString(),
    optionOne: {
      text: request.optionOneText,
      votes: []
    },
    optionTwo: {
      text: request.optionTwoText,
      votes: []
    }
  }
  logger.info("Created new question.", {question: question})

  try {
    await repo.putNew(question);
  } catch (e) {
    logger.error(e)
    throw e;
  }

  return question
}

