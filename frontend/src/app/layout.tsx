import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3005"),
  title: "Neepank Toolbox",
  description: "Advanced browser-based tools for OCR text extraction, PDF conversion, MP4 to GIF, P2P Data Transfer, QR Code generation, and image processing.",
  keywords: "OCR, PDF converter, image formatter, MP4 to GIF, QR code generator, P2P file transfer",
  authors: [{ name: "Neepank" }],
  alternates: {
    canonical: "/",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=JetBrains+Mono:wght@400;500&display=swap" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
