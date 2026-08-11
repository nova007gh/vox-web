import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import ExtensionErrorHandler from "@/components/ExtensionErrorHandler";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VOXel - Create. Connect. Earn.",
  description: "The AI-Powered Social, Commerce & Entertainment Platform. Join millions of creators, shoppers, and dreamers on VOX.",
  keywords: ["VOXel", "VOX", "social media", "marketplace", "live streaming", "creators", "wallet"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VOXel",
    startupImage: "/voxel-logo.svg",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/voxel-logo.svg",
    shortcut: "/voxel-logo.svg",
    apple: "/voxel-logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-vox-bg text-white`}
      >
        <AuthProvider>
          <ExtensionErrorHandler>{children}</ExtensionErrorHandler>
        </AuthProvider>
      </body>
    </html>
  );
}
