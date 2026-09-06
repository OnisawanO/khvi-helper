import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KHVI Helper | Find a trusted interpreter",
  description: "Connect with trusted volunteer interpreters when language support matters most.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
