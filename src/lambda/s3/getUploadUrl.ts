import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as AWS from "aws-sdk"
import {v4 as uuidv4} from 'uuid';
import {User} from "../../models/User"
import {getUserById, updateUser} from "../../services/UserService"
import {getUserId} from "../../utils/auth"
import {createLogger, initiateLambda} from "../../utils/logger";
import {badRequest, internalError, invalidUserId, requestSuccess} from "../shared"

const logger = createLogger("getUploadUrl")

const bucketName = process.env.AVATAR_BUCKET
const baseUrl = `http://${bucketName}.s3.amazonaws.com/`
const urlExpiration = Number(process.env.URL_EXPIRATION_IN_SECONDS)
const s3 = new AWS.S3({signatureVersion: "v4"})

/**
 * Handles GET requests for retrieving a signed URL for uploading an avatar.
 * CONSIDER If there's an error with upload, the user avatarUrl will point to an invalid
 *  object and display a broken image. A better solution would be to create a separate
 *  table with the old URL and the new URL. The S3 can send an SNS notification
 *  when an upload occurs, confirming the new URL is valid. That can then update
 *  the user record in the user table.
 * @method GET
 * @param event The event with authentication headers and an extension in the query
 *               string parameters.
 * @param context The current context.
 * @return APIGatewayProxyResult with the signed url for upload.
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context):
    Promise<APIGatewayProxyResult> => {
  initiateLambda(logger, event, context)

  const extension = event.queryStringParameters.ext
  if (!extension) {
    return badRequest("File extension type is required.", null)
  }
  if (!validExtension(extension)) {
    return badRequest("Invalid extension type. " +
        "Acceptable extensions are: 'jpg', 'jpeg', 'png'",
        {received: extension})
  }

  let userId: string;
  try {
    userId = getUserId(event, logger)
    logger.log("info", "Retrieved userId", {userId: userId})
  } catch (e) {
    logger.error(e.message)
    return invalidUserId()
  }

  let user: User
  try {
    user = await getUserById(userId)
    logger.info("Retrieved user.", {user: user})
  } catch (e) {
    return badRequest("Unable to find record of that user.", {userId: userId})
  }

  const objectName = uuidv4() + "." + extension

  const signedUrl = s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: objectName,
    Expires: urlExpiration,
  })

  user.avatarUrl = baseUrl + objectName

  try {
    await updateUser(user)
    logger.info("Updated user avatarUrl", {user: user})
  } catch (e) {
    logger.error(e.message)
    return internalError(e.message)
  }

  return requestSuccess(signedUrl)
}

const regex = new RegExp("^(jpg|jpeg|png)$")

function validExtension(ext: string): boolean {
  return regex.test(ext)
}
