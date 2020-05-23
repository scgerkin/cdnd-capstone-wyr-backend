export interface CreateQuestionRequest {
  optionOneText: string,
  optionTwoText: string
}

export interface CastVoteRequest {
  questionId: string,
  option: string,
  userId?: string
}
