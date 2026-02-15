import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../styles/globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME ?? "المتجر",
  description: process.env.NEXT_PUBLIC_STORE_DESCRIPTION ?? "متجر إلكتروني احترافي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body>
        <div className="bg">{children}</div>
      </body>
    </html>
  );
}

