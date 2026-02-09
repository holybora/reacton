"use client";

import { useState } from "react";
import type { TokenStatus } from "@/lib/types";

interface ApiTokenInputProps {
  value: string;
  onChange: (token: string) => void;
  tokenStatus: TokenStatus;
}

const BORDER_CLASSES: Record<TokenStatus, string> = {
  idle: "border-gray-700 focus:border-blue-500 focus:ring-blue-500",
  validating: "border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500",
  valid: "border-green-500 focus:border-green-400 focus:ring-green-400",
  invalid: "border-red-500 focus:border-red-400 focus:ring-red-400",
};

export default function ApiTokenInput({
  value,
  onChange,
  tokenStatus,
}: ApiTokenInputProps) {
  const [showToken, setShowToken] = useState(false);

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">API Token</label>
      <div className="relative">
        <input
          type={showToken ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter API token"
          autoComplete="off"
          className={`w-full bg-gray-800 text-gray-200 border rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-1 transition-colors ${BORDER_CLASSES[tokenStatus]}`}
        />
        <button
          type="button"
          onClick={() => setShowToken((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
          aria-label={showToken ? "Hide token" : "Show token"}
        >
          {showToken ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {tokenStatus === "validating" && (
        <p className="text-xs text-yellow-500 mt-1">Validating...</p>
      )}
      {tokenStatus === "valid" && (
        <p className="text-xs text-green-400 mt-1">Token valid</p>
      )}
      {tokenStatus === "invalid" && (
        <p className="text-xs text-red-400 mt-1">Invalid token</p>
      )}
    </div>
  );
}
