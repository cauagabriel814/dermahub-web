import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Corpo de texto
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

// Títulos — placeholder para Higuen Elegant Serif (premium)
// Para ativar Higuen: coloque os arquivos em /public/fonts/ e descomente @font-face no globals.css
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-brand",
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
      <body className={`${poppins.variable} ${cormorant.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
