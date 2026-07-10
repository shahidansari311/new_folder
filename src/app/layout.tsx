import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://akankshahid-birthday.vercel.app"),

  title: {
    default: "A Universe For Akanksha",
    template: "%s | A Universe For Akanksha",
  },

  description:
    "A magical interactive birthday experience created with love.",

  keywords: [
    "birthday",
    "interactive",
    "akanksha",
    "universe",
    "gift",
    "Akankshahid",
    "Happy birthday akanksha",
    "Suprise 12 septmber ",
    "birthday gift for akanksha",
    "birthday gift for a girl of age 20",
    "birthday gift for a girl of age 21"
  ],

  authors: [{ name: "Shahid Ansari" }],

  creator: "Shahid Ansari",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
