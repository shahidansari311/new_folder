import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://akankshahid-birthday.vercel.app"),

  title: {
    default: "A Universe For Akanksha | Happy Birthday",
    template: "%s | A Universe For Akanksha",
  },

  description:
    "A magical, interactive digital universe created with love for Akanksha's birthday. Explore our memories, messages, and a special time-traveling journey. Created by Shahid.",

  keywords: [
    "birthday",
    "interactive",
    "akanksha",
    "universe",
    "gift",
    "Akankshahid",
    "Happy birthday akanksha",
    "Surprise 12 september",
    "birthday gift for akanksha",
    "birthday gift for a girl of age 20",
    "birthday gift for a girl of age 21",
    "digital birthday gift",
    "interactive birthday website",
    "love letter",
    "akanksha birthday 2026",
    "best birthday website",
    "romantic birthday gift for girlfriend",
    "shahid and akanksha"
  ],

  authors: [{ name: "Shahid Ansari" }],
  creator: "Shahid Ansari",

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://akankshahid-birthday.vercel.app",
    title: "A Universe For Akanksha | Happy Birthday",
    description: "A magical, interactive digital universe created with love for Akanksha's birthday. Enter the time portal and explore our memories.",
    siteName: "A Universe For Akanksha",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A Universe For Akanksha Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "A Universe For Akanksha | Happy Birthday",
    description: "A magical, interactive digital universe created with love for Akanksha's birthday.",
    images: ["/og-image.jpg"],
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

  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#020617',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Dancing+Script:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Cinzel:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
