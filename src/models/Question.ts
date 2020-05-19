
export interface Question {
  id:        string
  author:    string
  timestamp: string
  optionOne: Option
  optionTwo: Option
}

export interface Option {
  votes: string[]
  text:  string
}
