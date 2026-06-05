import type { User, Session } from 'better-auth/db'

export type Env = {
  Variables: {
    user: User | null
    session: Session | null
  }
}