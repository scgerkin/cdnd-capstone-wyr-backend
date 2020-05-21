import {Context, DynamoDBStreamEvent, DynamoDBStreamHandler} from "aws-lambda";
import {Question, QuestionDateRecord} from "../../models/Question"
import {putDateRecord} from "../../repositories/QuestionRepository"
import {createLogger} from "../../utils/logger";
import {getYearMonthDateString, initiateLambda} from "../utils"

const logger = createLogger("handleQuestionUpdateStream")
export const QUESTION_IDS_BY_DATE_TABLE = process.env.QUESTION_IDS_BY_DATE_TABLE

const INSERT = "INSERT"
const MODIFY = "MODIFY"
const REMOVE = "REMOVE"

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent, context: Context) => {
  initiateLambda(logger, event, context)

  for (const record of event.Records) {
    logger.debug("Processing Record.", {record: record})
    try {
      await handleRecord(record)
    } catch (e) {
      logger.error(e)
    }
  }
}

async function handleRecord(record): Promise<any> {
  switch(record.eventName) {
    case INSERT: return await handleInsert(record)
    case MODIFY: return await handleModify(record)
    case REMOVE: return await handleRecord(record)
    default: return null
  }
}

async function handleInsert(record): Promise<QuestionDateRecord> {
  const dateRecord = getDateRecord(record)
  await putDateRecord(dateRecord)
  logger.info("New date record persisted.", {dateRecord: dateRecord})
  return dateRecord
}

//todo reserved for future use
async function handleModify(record): Promise<any> {
  return "Not implemented."
}

async function handleRemove(record): Promise<QuestionDateRecord> {
  const dateRecord = getDateRecord(record)
  await deleteDateRecord(dateRecord)
  logger.info("Date record removed.", {dateRecord: dateRecord})
  return dateRecord
}

function getDateRecord(record): QuestionDateRecord {
  const image = record.dynamodb.NewImage
  logger.debug("Image", {image: image})

  const createdAt = Number(image.createdAt.N)

  return {
    questionId: image.questionId.S,
    createdAt: createdAt,
    questionCreateDate: getYearMonthDateString(createdAt),
  }
}
