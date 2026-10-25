import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KostYusi - Kelola Sewa Kos & Tagihan",
  description: "Kelola sewa kos & tagihan jadi mudah & praktis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${poppins.variable} ${poppins.className} antialiased`}>
      <body className="min-h-screen font-sans text-slate-800">{children}</body>
    </html>
  );
}
