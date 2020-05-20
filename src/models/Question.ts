
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

export interface QuestionDateRecord {
  partitionKey: DatePartitionKey,
  questionId: string
}

export interface DatePartitionKey {
  yearMonthDay: string,
  createdAt:    number
}
