import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Luma Notes — a quieter place to think",
  description: "Secure notes, thoughtful posts, and a clear workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
