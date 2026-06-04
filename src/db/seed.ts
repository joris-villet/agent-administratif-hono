import { eq } from 'drizzle-orm'
import { db } from '@/db/index'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'

export const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL as string
  // const password = process.env.ADMIN_PASSWORD

  try {
    const admin = await db.select({ email: user.email }).from(user).where(eq(user.email, email))

    //console.log('admin => ', admin)

    if (!admin.length) {
      const data = await auth.api.signUpEmail({
        body: {
          name: process.env.USER_NAME as string,
          email: process.env.ADMIN_EMAIL as string,
          password: process.env.ADMIN_PASSWORD as string,
        },
      })
      console.log('data seed => ', data)
    } else {
      console.log('user already exists')
    }
  } catch (err) {
    console.log('err from seed admin => ', err)
    return 'user not register'
  }
}
