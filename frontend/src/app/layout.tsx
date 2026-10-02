import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3005"),
  title: "Neepank | Creative Toolbox Premium",
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
