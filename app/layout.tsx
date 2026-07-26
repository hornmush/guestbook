import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "칠곡농협 POP 요청",
  description: "칠곡농협 POP 제작 요청 게시판",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-zinc-50 min-h-screen text-zinc-900`}>
        {children}
      </body>
    </html>
  );
}
