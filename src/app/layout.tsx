import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoiceDev 2.0 - The Ultimate AI Agent Platform",
  description:
    "20+ AI Providers | 150+ Models | 6 Marketplaces | 250+ Tools | Streaming Chat | Dark/Light Theme | Zero Stubs | Production Ready",
  keywords: [
    "VoiceDev",
    "AI",
    "ChatGPT",
    "Claude",
    "Gemini",
    "GPT",
    "LLM",
    "AI Agent",
    "Platform",
  ],
  authors: [{ name: "Mohabsmar" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "VoiceDev 2.0",
    description: "The Ultimate AI Agent Platform",
    siteName: "VoiceDev",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
