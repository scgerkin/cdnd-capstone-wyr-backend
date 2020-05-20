
export interface Question {
  questionId: string
  authorId:   string
  createdAt:  string
  optionOne:  Option
  optionTwo:  Option
}

export interface Option {
  votes: string[]
  text:  string
}
