import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vi-SiT — Vision for your next Site",
  description:
    "Real-time livability scoring for Hyderabad neighborhoods and properties. Visit Score powered by environmental, infrastructure, and social data.",
  keywords: ["visit score", "vi-sit", "livability", "hyderabad", "real estate", "urban intelligence"],
};

import { ErrorSuppressor } from "@/components/ErrorSuppressor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent FOUC — applies saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('visit-theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased theme-transition`}
        style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}
      >
        <AuthProvider>
          <ErrorSuppressor />
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
