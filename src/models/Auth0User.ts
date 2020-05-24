
export interface Auth0User {
  user: {
    name:     string
    email:    string
    user_id:  string
    nickname: string
    picture?: string
  }
}
