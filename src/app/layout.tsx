import "../styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "sonner";
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
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Server components can only render other server components */}
        {/* So we move all client providers to a separate client component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
