import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Skip auth in local development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const authHeader = req.headers.get('authorization')

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const colonIndex = decoded.indexOf(':')
      const user = decoded.slice(0, colonIndex)
      const pass = decoded.slice(colonIndex + 1)

      const expectedUser = process.env.BASIC_AUTH_USER
      const expectedPass = process.env.BASIC_AUTH_PASSWORD

      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Galvin AI Sales Hub"',
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
