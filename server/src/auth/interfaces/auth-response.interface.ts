import type { User } from '@prisma/client';

export type SafeUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'name'
  | 'isAdmin'
  | 'createdAt'
  | 'updatedAt'
  | 'lastLoginAt'
>;

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
}
