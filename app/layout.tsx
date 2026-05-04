import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checklist Pioneiro",
  description: "Checklist diário de empilhadeiras e paleteiras",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
