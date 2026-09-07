import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { ok: false, error: { message, code } },
    { status }
  );
}
