import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"

async function getUser(email: string): Promise<any | undefined> {
  const demoUsers = [
    {
      id: "1",
      email: "demo@example.com",
      name: "Demo User",
      password: "demo123",
    },
  ]

  return demoUsers.find((user) => user.email === email)
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)

          if (!user) return null

          if (password === user.password) {
            return { id: user.id, email: user.email, name: user.name }
          }
        }

        return null
      },
    }),
  ],
})
