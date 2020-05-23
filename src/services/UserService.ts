import {User} from  "../models/User"
import {createLogger} from "../utils/logger"
import * as repo from "../repositories/UserRepository"

const logger = createLogger("UserService");

/**
 * add-doc
 * @param userId
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
