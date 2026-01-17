import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAS Developers - Interior Quotation System",
  description: "Professional interior quotation management system for MAS Developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
