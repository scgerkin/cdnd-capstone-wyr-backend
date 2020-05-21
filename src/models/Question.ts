
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
  yearMonthDay: string,
  createdAt:    number
}

export interface DateRecordRequest {
  yearMonthDay: string,
  limit?: number,
  lastEvaluatedKey?
}
