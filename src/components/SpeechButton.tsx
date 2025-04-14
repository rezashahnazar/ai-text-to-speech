"use client";

import { useState, KeyboardEvent } from "react";

export default function SpeechButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSpeech = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert to speech");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("api/speech/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate speech"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      (e.metaKey || e.ctrlKey) &&
      !isLoading &&
      text.trim()
    ) {
      e.preventDefault();
      handleSpeech();
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-[#1a1f2e]">
      <div className="w-full max-w-2xl bg-[#232838] rounded-3xl shadow-lg p-8 space-y-6 mx-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Text to Speech</h1>
          <p className="text-gray-400">
            Enter your text below and convert it to natural-sounding speech
          </p>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter text to convert to speech..."
            className={`w-full h-40 p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none
              bg-[#2b3140] border-[#3a4051] text-white
              placeholder:text-gray-500
              ${
                error
                  ? "border-rose-500 focus:ring-rose-500"
                  : "focus:ring-blue-500/50 focus:border-blue-500/50"
              }
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          />
          {error && (
            <p className="absolute -bottom-6 left-0 text-rose-500 text-sm animate-fade-in">
              {error}
            </p>
          )}
          <p className="absolute bottom-3 right-3 text-sm text-gray-500">
            Press ⌘+Enter to generate
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSpeech}
            disabled={isLoading || !text.trim()}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform
              ${
                isLoading || !text.trim()
                  ? "bg-[#2b3140] text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95"
              }
              ${isLoading ? "animate-pulse" : ""}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  ></path>
                </svg>
                Generate Speech
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
