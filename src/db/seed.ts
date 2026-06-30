import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

export const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  if (!email) throw new Error("ADMIN_EMAIL is not set in .env");

  const [admin] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!admin) {
    await auth.api.signUpEmail({
      body: {
        name: process.env.USER_NAME!,
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!,
      },
    });
    console.log("✅  Admin created");
  } else {
    console.log("ℹ️  Admin already exists");
  }
};
