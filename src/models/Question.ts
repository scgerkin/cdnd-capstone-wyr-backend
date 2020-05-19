
export interface Question {
  id:        string
  authorId:    string
  createdAt: string
  optionOne: Option
  optionTwo: Option
}

export interface Option {
  votes: string[]
  text:  string
}
