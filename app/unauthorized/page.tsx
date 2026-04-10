import Link from "next/link";

export const metadata = {
  title: "Unauthorized — Stay Vacation",
};

export default function UnauthorizedPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #1a3f4e 0%, #0f2a35 50%, #1a4a5e 100%)",
      }}
    >
      <div className="text-center px-4">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 text-5xl"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          🔒
        </div>
        <h1
          className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          403 — Unauthorized
        </h1>
        <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
          You don&apos;t have permission to access this page. Admin access is required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #2fa3f2, #1a7abf)", boxShadow: "0 8px 24px rgba(47,163,242,0.3)" }}
          >
            ← Go Home
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Sign in as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
