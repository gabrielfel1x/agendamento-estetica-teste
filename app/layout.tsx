import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import './globals.css';
import { ModalProvider } from '@/lib/modal-context';
import ClientSetup from '@/components/ClientSetup';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lumière Estética — Agendamento Online Premium',
  description:
    'Procedimentos estéticos exclusivos com profissionais certificados. Agende online em minutos, com confirmação imediata e atendimento personalizado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${outfit.variable}`}>
      <body>
        <ClientSetup />
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
