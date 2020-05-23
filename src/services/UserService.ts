import {User} from  "../models/User"
import {createLogger} from "../utils/logger"
import * as repo from "../repositories/UserRepository"

const logger = createLogger("UserService");

/**
 * Gets a specific user from the repository (if found).
 * @param userId The requested ID of the user to retrieve.
 * @returns The requested User.
 */
export async function getUserById(userId: string): Promise<User> {
  logger.debug("getUserById", {userId: userId})

  try {
    return await repo.queryUserById(userId)
  } catch (e) {
    logger.error("User with that ID could not be found.", {userId: userId})
    logger.error(e.message)
    throw e
  }
}

/**
 * Gets a list of Users from a list of IDs.
 * TODO Add limit/pagination handling
 *  Not a high priority as, at most, we'll be getting ~40-50 users at a time
 *  and the document client should handle that without issue
 * @param userIds The IDs of the users to retrieve.
 * @returns A list of Users found.
 */
export async function getUsers(userIds: string[]): Promise<User[]> {
  logger.debug("getUsers", {userIds: userIds})

  // make sure we're only getting unique records
  const uniqueIds = [...new Set(userIds)]
  if (uniqueIds.length !== userIds.length) {
    logger.warn("Duplicate IDs were found in request.", {
      userIds: userIds,
      uniqueIds: uniqueIds,
      difference: userIds.length - uniqueIds.length
    })
  }

  const ids = uniqueIds.map(id => {
    return {userId: id}
  })

  return await repo.batchGetUsers(ids)
}
