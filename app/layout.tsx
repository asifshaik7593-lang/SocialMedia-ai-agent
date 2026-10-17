import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Socially — your social media workspace",
  description: "Plan, create, and grow your social presence from one focused workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
