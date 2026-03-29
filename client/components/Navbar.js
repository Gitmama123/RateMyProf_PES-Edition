"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, clearToken } from "../lib/auth";

// Navbar – top navigation bar with branding
export default function Navbar() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    window.location.reload();
  };
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
              R
            </div>
            <div>
              <h1 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                RateMyProf
              </h1>
              <p className="text-[10px] text-gray-500 -mt-1 tracking-wider uppercase">
                PES Edition
              </p>
            </div>
          </Link>

          {/* Disclaimer / Auth Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <p className="text-xs text-gray-600 italic mr-2">
                Reviews are student opinions, not official evaluations
              </p>
            </div>
            
            {user ? (
              <div className="flex items-center gap-4 border-l border-gray-800 pl-4">
                <span className="text-sm text-indigo-400 font-medium">
                  Hi {user.role === "admin" ? "Admin" : user.username}
                </span>
                
                {user.role === "admin" && (
                  <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors border border-gray-700 hover:border-red-500/30"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
                <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                  Join Anonymously
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
