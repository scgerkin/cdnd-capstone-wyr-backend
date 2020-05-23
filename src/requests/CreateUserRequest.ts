export interface CreateUserRequest {
  userId: string,
  name: string,
  nickname?: string,
  email: string,
  avatarUrl?: string
}
