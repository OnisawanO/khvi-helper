import { NextResponse } from "next/server";

export type AuthApiSuccessResponse<T> = {
  ok: true;
  data: T;
};

export type AuthApiErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type AuthApiResponse<T> = AuthApiSuccessResponse<T> | AuthApiErrorResponse;

export function apiSuccess<T>(data: T, status = 200): NextResponse<AuthApiSuccessResponse<T>> {
  return NextResponse.json(
    { ok: true, data },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<AuthApiErrorResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
