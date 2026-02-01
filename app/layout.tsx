import "./globals.css";
import { ReactNode } from "react";
import ClientLayout from "./ClientLayout";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export const metadata = {
  title: "Sistema de Mantenimiento",
  description: "Aplicación de mantenimiento técnico con módulos de cotización, reparación y terminado.",
};

// ✅ Solo una función con export default
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppRouterCacheProvider>
          <ClientLayout>
              {children}
          </ClientLayout>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
