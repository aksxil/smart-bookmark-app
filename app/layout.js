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

export const metadata = {
  title: "Smart Bookmark App",
  description: "A fast, secure bookmark manager with live sync.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100dvh] relative`}
      >
        <div className="bg-mesh" />
        <div className="h-[100dvh] flex flex-col relative z-10">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          <footer className="shrink-0 border-t border-white/10 bg-black/20 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 py-4">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">

                {/* Left Text */}
                <p className="text-sm text-white/50">
                  © {new Date().getFullYear()} Smart Bookmark App ·{" "}
                  <span className="underline underline-offset-4">
                    Aakash Nishad
                  </span>
                </p>

                {/* Links */}
                <div className="flex items-center gap-3">

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/aakash-nishad/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 shadow-sm backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
                  >
                    LinkedIn
                  </a>

                  {/* GitHub */}
                  <a
                    href="https://github.com/aksxil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 shadow-sm backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
                  >
                    GitHub
                  </a>

                  {/* Portfolio */}
                  <a
                    href="https://aksxil.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 shadow-sm backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Portfolio
                  </a>

                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
