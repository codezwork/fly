import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "../components/SmoothScrolling";
import CustomCursor from "../components/CustomCursor";
import Footer from "../components/Footer";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import { NavProvider } from "../context/NavContext";
import { PreLaunchProvider } from "../context/PreLaunchContext";
import NavDrawer from "../components/NavDrawer";
import BrutalistToast from "../components/BrutalistToast";
import AuthInitializer from "../components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://flystore.site'),
  title: {
    template: '%s | FLY STORE',
    default: 'FLY STORE | Premium Minimal Clothing India',
  },
  description: 'FLY STORE - Premium Minimal Clothing India. Engineered garments that last. Explore our brutalist silhouettes and structural perfection.',
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased cursor-none`}
    >
      <body className="min-h-full flex flex-col cursor-none">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Fly Store",
              "url": "https://flystore.site",
              "logo": "https://flystore.site/logo.png",
              "sameAs": [
                "https://www.instagram.com/flystore.site/"
              ],
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "email": "contact@flystore.site",
                  "contactType": "customer support"
                }
              ]
            })
          }}
        />
        <PreLaunchProvider>
          <NavProvider>
              <AuthInitializer />
              <CustomCursor />
              <Header />
              <NavDrawer />
              <CartDrawer />
              <BrutalistToast />
              <SmoothScrolling>
                {children}
                <Footer />
              </SmoothScrolling>
          </NavProvider>
        </PreLaunchProvider>
      </body>
    </html>
  );
}
