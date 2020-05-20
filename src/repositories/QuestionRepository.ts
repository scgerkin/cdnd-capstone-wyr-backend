import * as DynamoDB from "aws-sdk/clients/dynamodb"
import {DocumentClient} from "aws-sdk/clients/dynamodb"
import {Question} from "../models/Question";

import {createLogger} from "../utils/logger"

const logger = createLogger("QuestionRepository");
const docClient: DocumentClient = new DynamoDB.DocumentClient();

export const QUESTIONS_TABLE = process.env.QUESTIONS_TABLE
export const QUESTION_ID_INDEX = process.env.QUESTION_ID_INDEX
export const AUTHOR_ID_INDEX = process.env.QUESTION_AUTHOR_ID_INDEX
export const QUESTION_CREATED_AT_INDEX = process.env.QUESTION_CREATED_AT_INDEX

export async function putNewQuestion(question: Question): Promise<Question> {
  logger.debug("putNewQuestion initiated.", {question: question})

  const statement = docClient.put({
    TableName: QUESTIONS_TABLE,
    Item: question,
  }).promise()
  logger.debug("Statement created.", {statement: statement})

  await statement;
  logger.debug("Statement awaited.")

  return question;
}

export async function queryByQuestionId(questionId: string): Promise<Question> {
  logger.debug(
      "queryByQuestionId initiated.",
      {
        questionId: questionId,
      })

  const query = docClient.query({
    TableName: QUESTIONS_TABLE,
    IndexName: QUESTION_ID_INDEX,
    KeyConditionExpression: `${QUESTION_ID_INDEX} = :questionId`,
    ExpressionAttributeValues: {
      ":questionId": questionId,
    },
  }).promise()
  logger.debug("Query created.", {query: query})

  const result = await query;
  logger.info("Query result", {result: result})

  if (!result || result.Items.length <= 0) {
    const msg = JSON.stringify({
      message: "Unable to retrieve question",
      questionId: questionId,
      result: result,
    })
    throw new Error(msg)
  }

  return result.Items[0] as Question
}

export async function deleteQuestion(question: Question): Promise<Question> {
  logger.debug(
      "deleteQuestion initiated.",
      {
        question: question,
      })

  const conditionExpression = `${QUESTION_ID_INDEX} = :questionId`
  logger.debug("Condition expression", {conditionExpression: conditionExpression})

  const statement = docClient.delete({
    TableName: QUESTIONS_TABLE,
    Key: {
      AUTHOR_ID_INDEX: question.authorId,
      QUESTION_CREATED_AT_INDEX: question.createdAt
    },
    ConditionExpression: conditionExpression,
    ExpressionAttributeValues: {
      ":questionId": question.id
    }
  }).promise()
  logger.debug("Statement created.", {statement: statement})

  await statement;
  logger.debug("Statement awaited.")

  return question
}
