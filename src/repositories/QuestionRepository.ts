/**
 * TODO:
 *  1. Refactor QuestionDateRecord into it's own repository, this is a little long
 *  2. Move the log start functions out into project utils. These are really handy.
 */
import * as DynamoDB from "aws-sdk/clients/dynamodb"
import {DocumentClient} from "aws-sdk/clients/dynamodb"

import {Question} from "../models/Question";
import {createLogger} from "../utils/logger"

const logger = createLogger("QuestionRepository");
const docClient: DocumentClient = new DynamoDB.DocumentClient();

export const QUESTIONS_TABLE = process.env.QUESTIONS_TABLE
export const QUESTION_ID_INDEX = process.env.QUESTION_ID_INDEX
export const QUESTION_AUTHOR_ID_INDEX = process.env.QUESTION_AUTHOR_ID_INDEX
export const QUESTION_CREATED_AT_INDEX = process.env.QUESTION_CREATED_AT_INDEX
export const MAX_QUERY_LIMIT = Number(process.env.MAX_QUERY_LIMIT)

/**
 * add-doc
 * @param question
 */
export async function putQuestion(question: Question): Promise<Question> {
  logStart("putQuestion", question)

  const parameters = {
    TableName: QUESTIONS_TABLE,
    Item: question,
  }
  logParameters(parameters)

  const result = await docClient.put(parameters).promise()
  logResult(result)

  return question;
}

/**
 * Queries the database for the requested Question by provided questionId.
 * @param questionId The userId of the record to retrieve.
 * @returns a Question record if found.
 */
export async function queryByQuestionId(questionId: string): Promise<Question> {
  logStart("queryByQuestionId", questionId)

  const parameters = {
    TableName: QUESTIONS_TABLE,
    IndexName: QUESTION_ID_INDEX,
    KeyConditionExpression: `${QUESTION_ID_INDEX} = :questionId`,
    ExpressionAttributeValues: {
      ":questionId": questionId,
    },
  }
  logParameters(parameters)

  const result = await docClient.query(parameters).promise()
  logResult(result)

  // fixme move into service
  if (!result || result.Items.length <= 0) {
    const msg = JSON.stringify({
      message: "Unable to retrieve question",
      questionId: questionId,
      result: result,
      parameters: parameters
    })
    throw new Error(msg)
  }

  return result.Items[0] as Question
}

/**
 * add-doc
 * @param question
 */
export async function deleteQuestion(question: Question): Promise<Question> {
  logStart("deleteQuestion", question)

  const conditionExpression = `${QUESTION_ID_INDEX} = :questionId`
  logger.debug("Condition expression", {conditionExpression: conditionExpression})

  const parameters = {
    TableName: QUESTIONS_TABLE,
    Key: {
      [QUESTION_AUTHOR_ID_INDEX]: question.authorId,
      [QUESTION_CREATED_AT_INDEX]: question.createdAt
    },
    ConditionExpression: conditionExpression,
    ExpressionAttributeValues: {
      ":questionId": question.questionId
    }
  }
  logParameters(parameters)

  const result = await docClient.delete(parameters).promise()
  logResult(result)

  return question
}

/**
 * add-doc
 * @param authorId
 */
export async function queryByAuthorId(authorId: string): Promise<Question[]> {
  logStart("queryByAuthorId", authorId)

  const parameters = {
    TableName: QUESTIONS_TABLE,
    KeyConditionExpression: `${QUESTION_AUTHOR_ID_INDEX} = :authorId`,
    ExpressionAttributeValues: { ":authorId": authorId}
  }
  logParameters(parameters)

  const result = await docClient.query(parameters).promise()
  logResult(result)

  return result.Items as Question[]
}

/**
 * add-doc
 * nts results are not ordered based on request
 * @param questionIds
 */
export async function batchGetQuestions(questionIds: {authorId: string, createdAt: number}[]): Promise<Question[]> {
  logStart("batchGetQuestions", questionIds)

  const parameters = {
    RequestItems: {
      [QUESTIONS_TABLE] : {
        Keys: questionIds
      }
    }
  }
  logParameters(parameters)

  const result = await docClient.batchGet(parameters).promise()
  logResult(result)

  return result.Responses[QUESTIONS_TABLE] as Question[]
}

/**
 * TODO Remove and use functions from utils/logger
 */

function logStart(funcName, args?) {
  logger.log("info", `Initiate ${funcName}.`, {args: args})
}

function logParameters(parameters) {
  logger.log("info", "Parameters created.", {parameters: parameters})
}

function logResult(result) {
  logger.log("info", "Result received.", {result: result})
}
