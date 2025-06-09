import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const roboto = Roboto_Flex({ subsets: ["latin"], variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "Movely",
  description: "Your car maintenance companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
