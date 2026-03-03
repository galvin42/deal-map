import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Skip auth in local development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, password] = atob(authValue).split(':')

    const validUser = process.env.BASIC_AUTH_USER ?? 'galvin'
    const validPassword = process.env.BASIC_AUTH_PASSWORD ?? ''

    if (user === validUser && password === validPassword && validPassword !== '') {
      return NextResponse.next()
    }
  }

  return new NextResponse('Access denied', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Galvin AI Sales Hub"',
    },
  })
}

// Protect all routes except Next.js internals and static files
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
