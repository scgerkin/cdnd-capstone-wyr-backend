import {Question} from "../models/Question"

/**
 * Gets date as a 'YYYY-MM-DD' from a Unix epoch timestamp.
 * @param unixTimestamp A unix epoch timestamp in millis.
 * @return A date string of the format 'YYYY-MM-DD'
 */
export function getYearMonthDateString(unixTimestamp: number): string {
  return new Date(unixTimestamp).toISOString().split("T")[0]
}

/**
 * For parsing a DynamoDB image of a Question into a Question object.
 * @param image The image to parse.
 * @returns a Question from the image.
 */
export function parseQuestionFromImage(image): Question {
  return {
    questionId: image.questionId.S,
    authorId: image.authorId.S,
    createdAt: image.createdAt.N,
    optionOne: {
      text: image.optionOne.M.text.S,
      votes: image.optionOne.M.votes.L.map(i => i.S),
    },
    optionTwo: {
      text: image.optionTwo.M.text.S,
      votes: image.optionTwo.M.votes.L.map(i => i.S),
    },
  }
}
