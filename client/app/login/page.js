"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken } from "../../lib/auth";
import { ShieldCheck, Lock, Fingerprint, ExternalLink, Shield, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { API_BASE } = require("../../lib/api");
      
      // Smart routing: Check if the user is a Student (SRN) or an Admin
      // PESU SRNs typically start with "PES"
      const isStudent = username.toUpperCase().startsWith("PES");
      const authEndpoint = isStudent ? "/api/auth/pesu-login" : "/api/auth/login";

      const res = await fetch(`${API_BASE}${authEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token, data.user);
        
        // Redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get("redirect");
          window.location.href = redirect || "/";
        }
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Network error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Sign In</h2>
        <div className="flex items-center justify-center gap-2 mb-8">
          <p className="text-gray-400 text-center text-sm">
            Please sign in with your PESU credentials to continue.
          </p>
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-gray-500 hover:text-indigo-400 cursor-help transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 border border-gray-700 rounded-lg text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl text-center">
              We use PESU credentials to prevent spam and ensure reviews come from verified PES students.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PESU SRN
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
              placeholder="e.g. PES1..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-medium py-3 px-4 rounded-xl transition-all ${
              loading
                ? "bg-indigo-600/50 cursor-not-allowed text-white/70"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            }`}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 space-y-6">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-4">Security & Transparency</p>
            
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-200">Safe Verification</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    We verify your status using the open-source <a href="https://github.com/pesu-dev/auth" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">PESU-Auth API <ExternalLink className="w-2 h-2" /></a>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5">
                <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-200">No Password Storage</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Your password is used once to establish a secure session and is <span className="text-amber-500/80 font-bold uppercase tracking-tighter">never saved</span> to our database.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5">
                <Fingerprint className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-200">Anonymous Identity</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Your SRN is hashed to ensure your reviews remain anonymous. Even admins cannot link a review back to your identity.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-indigo-300">Verified Community</p>
                  <p className="text-[10px] text-indigo-300/60 leading-relaxed">
                    Credential-based login prevents spamming and ensures that all reviews come from actual members of the PES community.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/5 rounded-xl p-3 border border-indigo-500/10 flex items-center gap-3">
             <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
             <p className="text-[10px] text-indigo-300/80 font-medium">
               This site utilizes end-to-end encryption for all sensitive data transfers.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
