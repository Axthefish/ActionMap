import type { Metadata } from "next";
import "./globals.css";
import StarryBackground from "@/components/StarryBackground";

export const metadata: Metadata = {
  title: "Dynamic Strategic Blueprint - AI-Powered Strategic Navigation",
  description: "Transform your goals into actionable strategies with AI-powered 3D blueprint visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StarryBackground />
        {children}
      </body>
    </html>
  );
}
