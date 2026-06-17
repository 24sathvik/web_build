import type { Metadata } from "next";
import { Exo, Roboto_Mono } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZYXEN | Engineering Tomorrow's Digital Universe",
  description: "ZYXEN is a futuristic technology company specializing in AI, Automation, Software Engineering, Cloud Solutions, and Digital Innovation.",
  keywords: ["AI Development Company", "Automation Solutions", "Custom Software Development", "Cloud Engineering", "Digital Transformation", "ZYXEN"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={clsx(
        exo.variable,
        robotoMono.variable,
        "h-full antialiased dark" // Force dark mode as it's a cinematic dark experience
      )}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-white overflow-x-hidden selection:bg-[#00D9FF] selection:text-black">
        {children}
      </body>
    </html>
  );
}
