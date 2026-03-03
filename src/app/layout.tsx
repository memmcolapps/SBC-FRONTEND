import "../styles/globals.css";
import "@fontsource-variable/inter";
import { type Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Smart Breaker Controller",
    default: "Smart Breaker Controller",
  },
  description: "Made By Momas R&D Team",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background antialiased"
        style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
