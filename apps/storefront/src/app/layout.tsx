import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.dwstore.lk'),
  title: "DWstore - Sri Lanka's Premier Electronics Store | dwstore.lk",
  description:
    "Buy original smartphones, laptops, audio gear, gaming consoles, accessories and smart electronics at best prices in Sri Lanka. Island-wide cash on delivery — DWstore.lk",
  icons: {
    icon: "/dwstoreicon_logo.png",
    shortcut: "/dwstoreicon_logo.png",
    apple: "/dwstoreicon_logo.png",
  },
  openGraph: {
    siteName: 'DWstore.lk',
    locale: 'en_LK',
    type: 'website',
    images: [
      {
        url: '/dwstoreicon_logo.png',
        width: 500,
        height: 500,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dwstorelk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
  },
  alternates: {
    canonical: 'https://www.dwstore.lk',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "DWstore.lk",
                  "url": "https://www.dwstore.lk",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.dwstore.lk/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "name": "DWstore.lk",
                  "url": "https://www.dwstore.lk",
                  "logo": "https://www.dwstore.lk/dwstoreicon_logo.png",
                  "sameAs": [],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+94-756693358",
                    "contactType": "customer service",
                    "availableLanguage": ["English", "Sinhala"]
                  }
                }
              ]
            })
          }}
        />
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1231922081314947');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1231922081314947&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
