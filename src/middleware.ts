import { NextRequest, NextResponse } from 'next/server';
import { createSlug } from './app/info/info';

export default function Middleware(req: NextRequest) {
  if (req.nextUrl.pathname === createSlug(req.nextUrl.pathname))
    return NextResponse.next();
  return NextResponse.redirect(
    new URL(`${req.nextUrl.origin}${createSlug(req.nextUrl.pathname)}`)
  );
}

export const config = {
  matcher: '/info/:path*',
};
