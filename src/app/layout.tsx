import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Lora } from 'next/font/google';

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'The story you never wrote',
  description: 'An AI-powered collaborator for the stories left untold.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${lora.variable}`}>
      <head />
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <footer className="relative w-full text-center py-4 text-muted-foreground text-sm">
          made by weirdnemo 🤍
        </footer>
      </body>
    </html>
  );
}
