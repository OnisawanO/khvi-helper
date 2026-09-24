import type { Metadata } from "next";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "@fontsource/noto-sans-thai/800.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-HVI | Map-based volunteer interpreter platform",
  description: "Create a language help request pin and let approved volunteer interpreters nearby claim matched jobs.",
  icons: {
    icon: [{ url: "/khvi-logo.png", type: "image/png" }],
    shortcut: [{ url: "/khvi-logo.png", type: "image/png" }],
    apple: [{ url: "/khvi-logo.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" dir="ltr" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
