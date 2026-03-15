"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <h1
            className="text-5xl font-normal tracking-tight mb-2 font-display"
          >
            LEVEL
          </h1>
          <p className="text-foreground-secondary text-sm">
            Personal OS
          </p>
        </div>

        {sent ? (
          <div className="bg-surface border border-border rounded-card p-6 text-center">
            <p className="text-foreground mb-1">Sprawdz email</p>
            <p className="text-foreground-secondary text-sm">
              Wyslalismy link logowania na{" "}
              <span className="text-foreground">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Twoj email"
                required
                className="w-full px-4 py-3 bg-surface border border-border rounded-card text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-white rounded-card font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Wysylanie..." : "Zaloguj sie"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
