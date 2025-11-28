// src/app/layout.tsx
// Root Layout Component
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import { PropsWithChildren } from "react";

export const metadata = {
  title: "Malibu Shop",
  description: "Malibu Shop - Pretty things",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
