import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectUrl") || "/";

  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.session?.token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log("No session found, creating anonymous user...");
  try {
    const signInResponse = await auth.api.signInAnonymous({
      query: {
        callbackURL: redirectUrl,
      },
      asResponse: true,
      headers: request.headers,
    });

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    const setCookie = signInResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    } else {
      console.log("No set-cookie header found in sign-in response");
    }

    return response;
  } catch (error) {
    console.error("Error creating anonymous user:", error);
    return NextResponse.json(
      { error: "Failed to create anonymous session" },
      { status: 500 }
    );
  }
}
