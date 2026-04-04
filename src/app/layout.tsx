import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Poppins para tudo (corpo + títulos)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DermaHub",
  description: "Gestão de relacionamento pós-procedimento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
