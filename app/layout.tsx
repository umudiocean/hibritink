import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HİBRİT İNK - Kompozit Kanal İndikatörü",
  description: "7 İndikatörü birleştiren profesyonel teknik analiz platformu",
  keywords: ["trading", "technical analysis", "indicators", "crypto", "stocks"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}

