
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
