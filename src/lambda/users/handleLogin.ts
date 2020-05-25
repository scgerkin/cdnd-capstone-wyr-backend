import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda"
import {Auth0User} from "../../models/Auth0User"
import {User} from "../../models/User"
import {getUserById, updateUser} from "../../services/UserService"
import {createLogger, initiateLambda} from "../../utils/logger"
import {internalError, requestSuccess} from "../shared"

const logger = createLogger("handleLogin")

const newUserPicture = "https://would-you-rather-backend-dev-avatars.s3.amazonaws.com/question-mark.png"

/**
 * Executed by Auth0 on login event. Checks if the user exists in the database.
 * Puts the user into the database (if not already present). This also has the
 * side effect of updating existing user information if anything has changed.
 * TODO Restrict api call to Auth0 rule origin only
 * FIXME This is just really hacky all over.
 * @param event The event containing an Auth0User
 * @param context
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context):
    Promise<APIGatewayProxyResult> => {
  initiateLambda(logger, event, context)

  let auth0User: Auth0User
  try {
    auth0User = JSON.parse(event.body)
    //fixme this could be better handled by modifying the information posted by
    // the rule
    auth0User.user.user_id = auth0User.user.user_id.split("|")[1]
    logger.debug("Parsed user body.", {auth0User: auth0User})
  } catch (e) {
    logger.error("Unable to parse event body.", {errorMsg: e.message})
  }

  let appUser: User
  try {
    appUser = await getUserById(auth0User.user.user_id)
  }catch (e) {
    logger.info("Unable to locate existing user. Creating a new one.", {user: auth0User})
  }

  if (!!appUser) {
    appUser = updateUserPropertiesFromAuth0(appUser, auth0User)
  } else {
    appUser = createUser(auth0User)
  }

  try {
    logger.debug("Updating user information", {appUser: appUser})
    appUser = await updateUser(appUser)
    logger.info("New user added.", {user: appUser})
    return requestSuccess(appUser)
  } catch (e) {
    logger.error(e.message)
    return internalError(e.message)
  }
}

//consider this, may not need/want to update from auth0 if we let the user set
// their name/display name within the app. Auth0 will override whatever they set
function updateUserPropertiesFromAuth0(dbVal: User, auth0: Auth0User): User {
  return {
    ...dbVal,
    name: auth0.user.name,
    email: auth0.user.email,
    nickname: auth0.user.nickname
  }
}

function createUser(auth0User: Auth0User): User {
  logger.debug("Create new user", {auth0user: auth0User})
  return {
    userId: auth0User.user.user_id,
    name: auth0User.user.name,
    email: auth0User.user.email,
    nickname: auth0User.user.nickname,
    avatarUrl: newUserPicture,
    answers: [],
    questions: []
  }
}
