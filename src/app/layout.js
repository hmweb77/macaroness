import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Macarons de Salé – Pâtisserie Fine et Authentique",
  description:
    "Découvrez Macarons de Salé, une boutique artisanale offrant des macarons faits main aux saveurs délicates : pistache, caramel, framboise, chocolat et plus. Livraison rapide partout au Maroc",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics Scripts - placed directly in body */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-86KL8KF298"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-86KL8KF298');
          `}
        </Script>
        
        {children}
      </body>
    </html>
  );
}