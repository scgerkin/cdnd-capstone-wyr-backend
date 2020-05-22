export interface User {
  userId:    string
  name:      string
  nickname?: string
  email:     string
  avatarUrl: string
  answers:   Answer[],
  questions: string[]
}

export interface Answer {
  questionId: string,
  answer:     string
}
