import Link from "next/link";
import { MapPin, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Tricolor stripe */}
      <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF9933] via-white to-[#138808] flex items-center justify-center shadow-lg border border-gray-200">
              <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#000080" strokeWidth="1.5" fill="none" />
                <circle cx="20" cy="20" r="6" fill="#000080" />
                <path d="M20 8 Q24 14 20 20 Q16 14 20 8Z" fill="#138808" opacity="0.8" />
                <path d="M20 32 Q24 26 20 20 Q16 26 20 32Z" fill="#138808" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* 404 */}
          <h1 className="text-8xl font-extrabold text-[#1a237e] mb-2 tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-lg font-semibold text-[#FF9933] mb-4" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            पृष्ठ नहीं मिला
          </p>
          <p className="text-gray-500 mb-8 leading-relaxed">
            The page you are looking for does not exist or has been moved.
            Please check the URL or navigate back to the homepage.
          </p>
          <p className="text-sm text-gray-400 mb-8" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है। कृपया होमपेज पर वापस जाएं।
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#138808] to-[#0E6B06] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Go to Homepage / होमपेज
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1a237e] font-semibold px-6 py-3 rounded-xl border border-gray-200 shadow hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <MapPin className="w-5 h-5" />
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center py-4 text-xs text-gray-400">
        DharaDrishti | धरादृष्टि — Smart Environmental Policy Mapping Platform
      </div>
    </div>
  );
}
