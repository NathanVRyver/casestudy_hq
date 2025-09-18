import { auth } from "@/auth/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/signin",
    "/api/auth/session",
    "/api/auth/providers", 
    "/api/auth/signin",
    "/api/auth/callback",
    "/api/auth/csrf"
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If user is not logged in and trying to access protected route
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  // If user is logged in and trying to access signin page, redirect to dashboard
  if (isLoggedIn && nextUrl.pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}