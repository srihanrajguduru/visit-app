import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Visit — Urban Intelligence Platform",
  description:
    "Real-time livability scoring for Hyderabad neighborhoods and properties. Powered by environmental, infrastructure, and social data.",
  keywords: ["visit score", "livability", "hyderabad", "real estate", "urban intelligence"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <AuthProvider>
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
