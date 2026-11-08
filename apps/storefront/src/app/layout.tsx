import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "DWstore - Sri Lanka's Premier Electronics Store | dwstore.lk",
  description:
    "Buy original smartphones, laptops, audio gear, gaming consoles, accessories and smart electronics at best prices in Sri Lanka. Island-wide cash on delivery — DWstore.lk",
  icons: {
    icon: "/dwstoreicon_logo.png",
    shortcut: "/dwstoreicon_logo.png",
    apple: "/dwstoreicon_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/dwstoreicon_logo.png" />
        <link rel="shortcut icon" href="/dwstoreicon_logo.png" />
        <link rel="apple-touch-icon" href="/dwstoreicon_logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
