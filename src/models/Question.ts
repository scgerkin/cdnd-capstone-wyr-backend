/**
 * TODO: Refactor these into separate files
 */

export interface Question {
  questionId: string
  authorId:   string
  createdAt:  number
  optionOne:  Option
  optionTwo:  Option
}

export interface Option {
  votes: string[]
  text:  string
}

//todo deprecate? or put into Question model
export interface QuestionPartitionKey {
  authorId:  string
  createdAt: number
}

// todo deprecate questionId
export interface QuestionDateRecord {
  questionCreateDate: string,
  createdAt: number,
  authorId: string,
  questionId: string
}

export interface DatePartitionKey {
  questionCreateDate: string,
  createdAt:    number
}

export interface DateRecordRequest {
  questionCreateDate: string,
  limit?: number,
  lastEvaluatedKey?: DatePartitionKey
}
