import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Setting a title template allows sub-pages (like Tasks) 
  // to automatically append their names to the project name.
  title: {
    default: "TaskFlow System",
    template: "%s | TaskFlow System",
  },
  description: "A clean and efficient task management system built with Laravel and Next.js.",
  authors: [{ name: "Abdulrahman Hamdi", url: "https://github.com/abdulrahmanhamdi" }],
  keywords: ["Task Management", "Laravel", "Next.js", "Filament"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-slate-900`}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}