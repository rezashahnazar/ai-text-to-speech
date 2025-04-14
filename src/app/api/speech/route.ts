import { experimental_generateSpeech as generateSpeech } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const audio = await generateSpeech({
      model: openai.speech("tts-1-hd"),
      text: text,
      voice: "alloy",
      abortSignal: AbortSignal.timeout(30000),
      providerOptions: {
        openai: {
          instructions: "You are a helpful assistant that speaks in Persian.",
          speed: 1.2,
        },
      },
    });

    const audioData = audio.audio.uint8Array;

    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating speech:", error);

    if (error instanceof Error) {
      if (error.name === "AI_NoAudioGeneratedError") {
        console.log("AI_NoAudioGeneratedError");
        console.log("Cause:", error.cause);
        console.log(
          "Responses:",
          (error as unknown as { responses: string[] }).responses
        );

        return NextResponse.json(
          {
            error: "Failed to generate speech",
            cause: error.cause,
            responses: (error as unknown as { responses: string[] }).responses,
          },
          { status: 500 }
        );
      }

      if (error.name === "TimeoutError") {
        return NextResponse.json(
          {
            error: "Speech generation timed out",
            message: "The request took too long to process. Please try again.",
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
