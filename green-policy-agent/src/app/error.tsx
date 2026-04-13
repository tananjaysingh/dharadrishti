"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DharaDrishti Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center px-4">
      {/* Icon */}
      <div className="w-16 h-16 bg-red-100 flex items-center justify-center rounded-full mb-6 border border-red-200 shadow-md">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        System Error / सिस्टम त्रुटि
      </h2>
      <p className="text-gray-500 mb-2 max-w-sm">
        DharaDrishti encountered an unexpected error. Our team has been notified.
      </p>
      <p
        className="text-sm text-[#FF9933] mb-8 max-w-sm"
        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
      >
        एक अप्रत्याशित त्रुटि हुई है। कृपया पुनः प्रयास करें।
      </p>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-sm shadow hover:shadow-md transition-all"
        >
          <Home className="w-4 h-4 mr-2" />
          Homepage
        </button>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#138808] to-[#0E6B06] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again / पुनः प्रयास
        </button>
      </div>
    </div>
  );
}
