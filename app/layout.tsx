import "./globals.css";
import { ReactNode } from "react";
import { Box } from "@mui/material";
import Sidebar from "./components/sidebar/sidebar";

export const metadata = {
  title: "Sistema de Mantenimiento",
  description: "Aplicación de mantenimiento técnico con módulos de cotización, reparación y terminado.",
};

// ✅ Solo una función con export default
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          {/* Menú lateral */}
          <Sidebar />
          {/* Contenido principal */}
          <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5", p: 3 }}>
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}
