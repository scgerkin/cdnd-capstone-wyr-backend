import * as DynamoDB from "aws-sdk/clients/dynamodb"
import {DocumentClient} from "aws-sdk/clients/dynamodb"
import {Question, QuestionDateRecord} from "../models/Question";

import {createLogger} from "../utils/logger"

const logger = createLogger("QuestionRepository");
const docClient: DocumentClient = new DynamoDB.DocumentClient();

export const QUESTIONS_TABLE = process.env.QUESTIONS_TABLE
export const QUESTION_ID_INDEX = process.env.QUESTION_ID_INDEX
export const QUESTION_AUTHOR_ID_INDEX = process.env.QUESTION_AUTHOR_ID_INDEX
export const QUESTION_CREATED_AT_INDEX = process.env.QUESTION_CREATED_AT_INDEX
export const QUESTION_IDS_BY_DATE_TABLE = process.env.QUESTION_IDS_BY_DATE_TABLE

export async function putNewQuestion(question: Question): Promise<Question> {
  logStart("putNewQuestion", question)

  const statement = {
    TableName: QUESTIONS_TABLE,
    Item: question,
  }
  logStatement(statement)

  const result = await docClient.put(statement).promise()
  logResult(result)

  return question;
}

export async function queryByQuestionId(questionId: string): Promise<Question> {
  logStart("queryByQuestionId", questionId)

  const statement = {
    TableName: QUESTIONS_TABLE,
    IndexName: QUESTION_ID_INDEX,
    KeyConditionExpression: `${QUESTION_ID_INDEX} = :questionId`,
    ExpressionAttributeValues: {
      ":questionId": questionId,
    },
  }
  logStatement(statement)

  const result = await docClient.query(statement).promise()
  logResult(result)

  // fixme move into service
  if (!result || result.Items.length <= 0) {
    const msg = JSON.stringify({
      message: "Unable to retrieve question",
      questionId: questionId,
      result: result,
      statement: statement
    })
    throw new Error(msg)
  }

  return result.Items[0] as Question
}

export async function deleteQuestion(question: Question): Promise<Question> {
  logStart("deleteQuestion", question)

  const conditionExpression = `${QUESTION_ID_INDEX} = :questionId`
  logger.debug("Condition expression", {conditionExpression: conditionExpression})

  const statement = {
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
  logStatement(statement)

  const result = await docClient.delete(statement).promise()
  logResult(result)

  return question
}

export async function queryByAuthorId(authorId: string): Promise<Question[]> {
  logStart("queryByAuthorId", authorId)

  const statement = {
    TableName: QUESTIONS_TABLE,
    KeyConditionExpression: `${QUESTION_AUTHOR_ID_INDEX} = :authorId`,
    ExpressionAttributeValues: { ":authorId": authorId}
  }
  logStatement(statement)

  const result = await docClient.query(statement).promise()
  logResult(result)

  return result.Items as Question[]
}

export async function putDateRecord(dateRecord: QuestionDateRecord): Promise<QuestionDateRecord> {
  logStart("putDateRecord", {dateRecord: dateRecord})

  const statement = {
    TableName: QUESTION_IDS_BY_DATE_TABLE,
    Item: dateRecord
  }
  logStatement(statement)

  const result = await docClient.put(statement).promise()
  logResult(result)

  return dateRecord
}

function logStart(funcName, args?) {
  logger.log("debug", `Initiate ${funcName}.`, {args: args})
}

function logStatement(statement) {
  logger.log("debug", "Statement created.", {statement: statement})
}

function logResult(result) {
  logger.log("info", "Result received.", {result: result})
}

export async function deleteDateRecord(dateRecord: QuestionDateRecord): Promise<QuestionDateRecord> {
  logStart("deleteDateRecord", {dateRecord: dateRecord})

  const statement = {
    TableName: QUESTION_IDS_BY_DATE_TABLE,
    Key: {
      questionCreateDate: dateRecord.questionCreateDate,
      createdAt: dateRecord.createdAt
    },
    ConditionExpression: `${QUESTION_ID_INDEX} = :questionId`,
    ExpressionAttributeValues: {
      ":questionId": dateRecord.questionId
    }
  }
  logStatement(statement)

  const result = await docClient.delete(statement).promise()
  logResult(result)

  return dateRecord
}
