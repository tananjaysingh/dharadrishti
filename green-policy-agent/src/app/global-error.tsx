"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background: "#f9fafb", color: "#111827" }}>
        <div style={{ display: "flex", height: "100vh", width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "1rem" }}>
          {/* Tricolor top line */}
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(to right, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%)" }} />

          <div style={{ width: "64px", height: "64px", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", marginBottom: "24px", border: "1px solid #FECACA" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>Critical System Error</h2>
          <p style={{ color: "#FF9933", fontWeight: 600, marginBottom: "8px", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            गंभीर सिस्टम त्रुटि
          </p>
          <p style={{ color: "#6B7280", marginBottom: "32px", maxWidth: "400px" }}>
            A critical error occurred in the DharaDrishti platform. Please try reloading.
          </p>

          <button
            onClick={() => reset()}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #138808, #0E6B06)",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: "0 4px 14px -3px rgba(19, 136, 8, 0.4)",
            }}
          >
            Reload Page / पेज रीलोड करें
          </button>

          <p style={{ marginTop: "32px", fontSize: "12px", color: "#9CA3AF" }}>
            DharaDrishti | धरादृष्टि — Smart Environmental Policy Mapping Platform
          </p>
        </div>
      </body>
    </html>
  );
}
