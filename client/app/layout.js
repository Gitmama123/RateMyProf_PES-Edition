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
      <body 
        className="antialiased flex flex-col min-h-screen bg-gray-50 text-gray-900"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
