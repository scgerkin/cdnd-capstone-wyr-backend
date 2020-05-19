import * as DynamoDB from "aws-sdk/clients/dynamodb"
import {DocumentClient} from "aws-sdk/clients/dynamodb"

import {createLogger} from "../utils/logger"
import {Question} from "../models/Question";

const logger = createLogger("QuestionRepository");
const docClient: DocumentClient = new DynamoDB.DocumentClient();

export const QUESTIONS_TABLE = process.env.QUESTIONS_TABLE
export const QUESTION_ID_INDEX = process.env.QUESTION_ID_INDEX
export const AUTHOR_ID_INDEX = process.env.QUESTION_AUTHOR_ID_INDEX
export const QUESTION_CREATED_AT_INDEX = process.env.QUESTION_CREATED_AT_INDEX

export async function putNew(question: Question): Promise<Question> {
  logger.debug("putNew initiated.", {question: question})

  const statement = docClient.put({
    TableName: QUESTIONS_TABLE,
    Item: question
  }).promise()
  console.debug("Statement created.", {statement: statement})

  await statement;
  console.debug("Statement awaited.")

  return question;
}

