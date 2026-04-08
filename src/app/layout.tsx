import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "../components/SmoothScrolling";
import CustomCursor from "../components/CustomCursor";
import Footer from "../components/Footer";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import { NavProvider } from "../context/NavContext";
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
  title: "Fly Store",
  description: "Fly Store - The Limited Edition Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable}₹{geistMono.variable} h-full antialiased cursor-none`}
    >
      <body className="min-h-full flex flex-col cursor-none">
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
      </body>
    </html>
  );
}
