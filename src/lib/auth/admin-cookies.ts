import { NextResponse } from "next/server";
import { REFRESH_TOKEN_MAX_AGE_SECONDS } from "./jwt";
import {
  ADMIN_ACCESS_COOKIE_NAME,
  ADMIN_ACCESS_TOKEN_MAX_AGE_SECONDS,
  ADMIN_REFRESH_COOKIE_NAME,
} from "./admin";

const isProduction = process.env.NODE_ENV === "production";

export function setAdminAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string,
) {
  response.cookies.set({
    name: ADMIN_ACCESS_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  if (refreshToken) {
    response.cookies.set({
      name: ADMIN_REFRESH_COOKIE_NAME,
      value: refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  }

  return response;
}

export function clearAdminAuthCookies(response: NextResponse) {
  for (const name of [ADMIN_ACCESS_COOKIE_NAME, ADMIN_REFRESH_COOKIE_NAME]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}
