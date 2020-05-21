import {Context, DynamoDBStreamEvent, DynamoDBStreamHandler} from "aws-lambda";
import {QuestionDateRecord} from "../../models/Question"
import {deleteDateRecord, putDateRecord} from "../../repositories/QuestionRepository"
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
      logger.error("Error handling record.", {error: e, record: record})
    }
  }
}

async function handleRecord(record): Promise<any> {
  switch(record.eventName) {
    case INSERT: return await handleInsert(record)
    case MODIFY: return await handleModify(record)
    case REMOVE: return await handleRemove(record)
    default: return null
  }
}

async function handleInsert(record): Promise<QuestionDateRecord> {
  const image = record.dynamodb.NewImage
  if (!image) {
    throw new Error("No image present on record.")
  }
  logger.debug("Image", {image: image})

  const dateRecord = getDateRecord(image)
  await putDateRecord(dateRecord)
  logger.info("New date record persisted.", {dateRecord: dateRecord})
  return dateRecord
}

//todo reserved for future use
async function handleModify(record): Promise<any> {
  logger.info("Handle modify called.", {record: record})
  return "Not implemented."
}

async function handleRemove(record): Promise<QuestionDateRecord> {
  const image = record.dynamodb.OldImage
  if (!image) {
    throw new Error("No image present on record.")
  }
  logger.debug("Image", {image: image})

  const dateRecord = getDateRecord(image)
  await deleteDateRecord(dateRecord)
  logger.info("Date record removed.", {dateRecord: dateRecord})

  return dateRecord
}

function getDateRecord(image): QuestionDateRecord {
  const createdAt = Number(image.createdAt.N)
  return {
    questionId: image.questionId.S,
    createdAt: Number(image.createdAt.N),
    questionCreateDate: getYearMonthDateString(createdAt),
  }
}
