"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself. It replaces the
 * root layout when it renders, so it ships its own document shell and inline
 * styles rather than relying on the app's stylesheet being present.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="mn">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#ffffff",
          color: "#172554",
        }}
      >
        <div style={{ maxWidth: "420px", textAlign: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Алдаа гарлаа
          </h1>
          <p
            style={{
              marginTop: "12px",
              lineHeight: 1.6,
              color: "#64748b",
            }}
          >
            Уучлаарай, сайтыг ачаалахад ноцтой асуудал гарлаа. Хуудсыг дахин
            ачаалж үзнэ үү.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#d97706",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Дахин оролдох
          </button>
        </div>
      </body>
    </html>
  );
}
