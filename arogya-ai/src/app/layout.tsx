import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "ArogyaAI – Your Digital Health Sanctuary",
  description: "Empower your wellness journey through intelligent document synthesis, mental health support, and radically positive care guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
          <Chatbot />
        </LanguageProvider>
      </body>
    </html>
  );
}
