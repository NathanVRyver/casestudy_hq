import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

// Simple in-memory user store (no bcrypt for now to avoid issues)
const users = [
  {
    id: "1",
    email: "admin@athenahq.com",
    name: "Admin User",
    password: "admin123",
  },
  {
    id: "2", 
    email: "demo@athenahq.com",
    name: "Demo User",
    password: "demo123",
  }
]

function getUser(email: string) {
  return users.find((user) => user.email === email)
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "Enter your email" 
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Enter your password"
        }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ 
            email: z.string().email(), 
            password: z.string().min(3) 
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = getUser(email)

          if (!user) return null

          if (password === user.password) {
            return { 
              id: user.id, 
              email: user.email, 
              name: user.name 
            }
          }
        }

        return null
      },
    }),
  ],
})
