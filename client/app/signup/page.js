"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken } from "../../lib/auth";

export default function SignupPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { API_BASE } = require("../../lib/api");
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token, data.user);
        setSuccessData({ username: data.user.username });
      } else {
        setError(data.error || "Failed to sign up.");
      }
    } catch (err) {
      setError("Network error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-gray-900/80 border border-green-500/30 rounded-2xl p-8 text-center shadow-lg shadow-green-500/10">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-gray-400 mb-6">
            Your anonymous identity is ready. Please save your assigned ID somewhere safe, as you will need it to log in again.
          </p>
          
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-8">
            <p className="text-sm text-gray-500 mb-1">Your assigned ID:</p>
            <p className="text-2xl font-mono text-indigo-400 font-bold tracking-wider">{successData.username}</p>
          </div>

          <button
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              const redirect = searchParams.get("redirect");
              window.location.href = redirect || "/";
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Join Anonymously</h2>
        <p className="text-gray-400 mb-8 text-center text-sm">
          No email required. We will automatically generate a randomized ID for you to protect your privacy.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choose a Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-medium py-3 px-4 rounded-xl transition-all ${
              loading
                ? "bg-indigo-600/50 cursor-not-allowed text-white/70"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
            }`}
          >
            {loading ? "Generating ID..." : "Generate Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Already have an ID?{" "}
            <button 
              onClick={() => {
                const search = window.location.search;
                window.location.href = `/login${search}`;
              }} 
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
