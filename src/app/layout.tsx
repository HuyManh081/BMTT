import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nhịp | Không gian công việc",
  description: "Không gian làm việc chung của đội ngũ Nhịp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}