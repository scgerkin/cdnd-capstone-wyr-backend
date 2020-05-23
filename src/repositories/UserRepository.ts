import * as DynamoDB from "aws-sdk/clients/dynamodb"
import {DocumentClient} from "aws-sdk/clients/dynamodb"

import {User} from  "../models/User"
import {createLogger, logRepoParameters, logRepoResult, logStart} from "../utils/logger"

const logger = createLogger("UserRepository")
const docClient: DocumentClient = new DynamoDB.DocumentClient();

export const USERS_TABLE = process.env.USERS_TABLE
export const USER_ID_INDEX = process.env.USER_ID_INDEX

/**
 * Queries the database for the requested User by provided userId.
 * @param userId The userId of the record to retrieve.
 * @returns a User record if found.
 */
export async function queryUserById(userId: string): Promise<User> {
  logStart(logger,"queryUserById", userId)

  const parameters = {
    TableName: USERS_TABLE,
    KeyConditionExpression: `${USER_ID_INDEX} = :userId`,
    ExpressionAttributeValues: {
      ":userId": userId
    }
  }
  logRepoParameters(logger, parameters)

  const result = await docClient.query(parameters).promise()
  logRepoResult(logger, result)

  if (!result || result.Items.length <= 0) {
    const msg = JSON.stringify({
      message: "Unable to retrieve user",
      userId: userId,
      result: result,
      parameters: parameters
    })
    throw new Error(msg)
  }

  return result.Items[0] as User
}

/**
 * add-doc
 * @param userIds
 */
export async function batchGetUsers(userIds: {userId: string}[]): Promise<User[]> {
  logStart(logger, "batchGetUsers", userIds)

  const parameters = {
    RequestItems: {
      [USERS_TABLE]: {
        Keys: userIds
      }
    }
  }
  logRepoParameters(logger, parameters)

  const result = await docClient.batchGet(parameters).promise()
  logRepoResult(logger, result)

  return result.Responses[USERS_TABLE] as User[]
}
