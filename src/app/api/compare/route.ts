import { NextRequest, NextResponse } from "next/server";
import type { CompareRequest, CompareResponse, ModelResponse } from "@/lib/types";
import { getProvider } from "@/lib/providers";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export async function POST(
  request: NextRequest
): Promise<NextResponse<CompareResponse>> {
  try {
    const body: CompareRequest = await request.json();

    if (!body.prompt?.trim() || !body.models?.length) {
      return NextResponse.json({ responses: [] }, { status: 400 });
    }

    const promises = body.models.map(
      async (model): Promise<ModelResponse> => {
        const startTime = Date.now();

        try {
          const provider = getProvider(model.provider);
          const result = await provider.callModel(
            body.prompt,
            SYSTEM_PROMPT,
            model.token,
            model.modelId
          );

          return {
            modelId: model.modelId,
            content: result.content,
            error: null,
            latencyMs: Date.now() - startTime,
            status: "success",
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            modelId: model.modelId,
            content: null,
            error: message,
            latencyMs: Date.now() - startTime,
            status: "error",
          };
        }
      }
    );

    const results = await Promise.allSettled(promises);

    const responses: ModelResponse[] = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return {
        modelId: body.models[index].modelId,
        content: null,
        error: result.reason?.message ?? "Unexpected error",
        latencyMs: 0,
        status: "error" as const,
      };
    });

    return NextResponse.json({ responses });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Request failed";
    return NextResponse.json(
      {
        responses: [
          {
            modelId: "unknown",
            content: null,
            error: message,
            latencyMs: 0,
            status: "error" as const,
          },
        ],
      },
      { status: 500 }
    );
  }
}
