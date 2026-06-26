import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Segment Console · Credit Card Clustering",
  description:
    "Analyst dashboard for K-Means++ credit card customer segmentation and persona lookup.",
  icons: {
    icon: [],
    apple: [],
    shortcut: [],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("segment-theme");var b=localStorage.getItem("segment-bg");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");document.documentElement.setAttribute("data-bg",b==="flow"||b==="grid"||b==="aurora"?b:"aurora");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
