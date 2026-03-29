"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken } from "../../lib/auth";

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
      const res = await fetch(`${API_BASE}/api/auth/login`, {
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
        setError(data.error || "Login failed.");
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
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Log In</h2>
        <p className="text-gray-400 mb-8 text-center text-sm">
          Welcome back! Enter your assigned ID and password.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
              placeholder="e.g. User_xY9Zab or ssmeduri"
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
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
            }`}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Lost your ID or new here?{" "}
            <button 
              onClick={() => {
                const search = window.location.search;
                window.location.href = `/signup${search}`;
              }} 
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Get a new ID
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
