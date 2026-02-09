import { NextRequest, NextResponse } from "next/server";
import type { ValidateTokenRequest, ValidateTokenResponse } from "@/lib/types";
import { getProvider } from "@/lib/providers";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ValidateTokenResponse>> {
  try {
    const body: ValidateTokenRequest = await request.json();

    if (!body.provider || !body.token) {
      return NextResponse.json(
        { valid: false, error: "Missing provider or token" },
        { status: 400 }
      );
    }

    const provider = getProvider(body.provider);
    const valid = await provider.validateToken(body.token);

    return NextResponse.json({ valid });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json(
      { valid: false, error: message },
      { status: 500 }
    );
  }
}
