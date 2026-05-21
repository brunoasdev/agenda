// app/layout.tsx
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cadastro de Regiões',
  description: 'CRUD de Regiões com Firebase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}