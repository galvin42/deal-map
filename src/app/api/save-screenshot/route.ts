import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export async function POST(req: NextRequest) {
  const { base64, filename } = await req.json()
  const data = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(data, 'base64')
  const dest = filename.startsWith('/') ? filename : join(homedir(), 'Downloads', filename)
  writeFileSync(dest, buffer)
  return NextResponse.json({ saved: dest })
}
