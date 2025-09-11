import React from 'react';

import { Geist, Geist_Mono } from 'next/font/google';

import type { Metadata } from 'next';

import AuthGuard from '@/components/auth/AuthGuard';
import ToastContainer from '@/components/layout/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import StoreProvider from '@/providers/StoreProvider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Учет отпусков',
  description: 'Сервис для учета отпусков сотрудников',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          <StoreProvider>
            <AuthGuard>
              {children}
              <ToastContainer />
            </AuthGuard>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
