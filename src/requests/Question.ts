export interface CreateQuestionRequest {
  optionOneText: string,
  optionTwoText: string
}

export interface CastVoteRequest {
  questionId: string,
  optionText: string,
  userId?: string
}
