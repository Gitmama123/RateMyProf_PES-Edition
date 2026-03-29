import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rate My Prof – PES Edition",
  description:
    "A platform for PES students to view, search, and anonymously rate professors.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        {/* Footer */}
        <footer className="border-t border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-600">
              Rate My Prof – PES Edition • Reviews are student opinions, not
              official evaluations
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
