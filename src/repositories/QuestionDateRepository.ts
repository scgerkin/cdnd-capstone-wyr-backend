import {DocumentClient} from "aws-sdk/clients/dynamodb"
import * as DynamoDB from "aws-sdk/clients/dynamodb"
import QueryOutput = DocumentClient.QueryOutput

import {DateRecordRequest, QuestionDateRecord} from "../models/Question"
import {createLogger, logRepoParameters, logRepoResult, logStart} from "../utils/logger"
import {MAX_QUERY_LIMIT} from "./QuestionRepository"

const logger = createLogger("QuestionDateRepository");
const docClient: DocumentClient = new DynamoDB.DocumentClient();

export const QUESTION_IDS_BY_DATE_TABLE = process.env.QUESTION_IDS_BY_DATE_TABLE

/**
 * add-doc
 * @param dateRecord
 */
export async function putDateRecord(dateRecord: QuestionDateRecord): Promise<QuestionDateRecord> {
  logStart(logger,"putDateRecord", {dateRecord: dateRecord})

  const parameters = {
    TableName: QUESTION_IDS_BY_DATE_TABLE,
    Item: dateRecord,
  }
  logRepoParameters(logger, parameters)

  const result = await docClient.put(parameters).promise()
  logRepoResult(logger, result)

  return dateRecord
}

/**
 * add-doc
 * @param dateRecord
 */
export async function deleteDateRecord(dateRecord: QuestionDateRecord): Promise<QuestionDateRecord> {
  logStart(logger, "deleteDateRecord", {dateRecord: dateRecord})

  const parameters = {
    TableName: QUESTION_IDS_BY_DATE_TABLE,
    Key: {
      questionCreateDate: dateRecord.questionCreateDate,
      createdAt: dateRecord.createdAt,
    },
    ConditionExpression: `questionId = :questionId`,
    ExpressionAttributeValues: {
      ":questionId": dateRecord.questionId,
    },
  }
  logRepoParameters(logger, parameters)

  const result = await docClient.delete(parameters).promise()
  logRepoResult(logger, result)

  return dateRecord
}

/**
 * add-doc
 * @param request
 */
export async function getDateRecords(request: DateRecordRequest): Promise<QuestionDateRecord[]> {
  logStart(logger, "getDateRecords", {request: request})

  let parameters = {
    TableName: QUESTION_IDS_BY_DATE_TABLE,
    Limit: request.limit < MAX_QUERY_LIMIT ? request.limit : MAX_QUERY_LIMIT,
    KeyConditionExpression: "questionCreateDate = :questionCreateDate",
    ExpressionAttributeValues: {":questionCreateDate": request.questionCreateDate},
    ExclusiveStartKey: request.lastEvaluatedKey ? request.lastEvaluatedKey : null,
    ScanIndexForward: false,
  }
  logRepoParameters(logger, parameters)

  let result: QueryOutput = await docClient.query(parameters).promise()
  logRepoResult(logger, result)

  let questionDateRecords = result.Items as QuestionDateRecord[]
  logger.debug("questionDateRecords", {questionDateRecords: questionDateRecords})

  while (!!result.LastEvaluatedKey && questionDateRecords.length < request.limit) {
    logger.debug("LastEvaluatedKey", {LastEvaluatedKey: result.LastEvaluatedKey})
    parameters = {
      ...parameters,
      // @ts-ignore
      ExclusiveStartKey: result.LastEvaluatedKey,
    }
    logRepoParameters(logger, parameters)
    result = await docClient.query(parameters).promise()
    logRepoResult(logger, result)
    questionDateRecords = questionDateRecords.concat(result.Items as QuestionDateRecord[])
    logger.debug("questionDateRecords", {questionDateRecords: questionDateRecords})
  }

  return questionDateRecords
}

/**
 * add-doc
 */
export async function getDateRecordCount(): Promise<number> {
  logStart(logger, "getDateRecordCount")

  const parameters = {
    TableName: QUESTION_IDS_BY_DATE_TABLE,
  }
  logRepoParameters(logger, parameters)

  const db = new DynamoDB
  const result = await db.describeTable(parameters).promise()
  logRepoResult(logger, result)

  return result.Table.ItemCount
}
