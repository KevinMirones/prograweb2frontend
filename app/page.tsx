"use client";

import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
        Bienvenido al Sistema de Mantenimiento
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Selecciona un módulo en el menú lateral para comenzar:
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 2 }}>
        (Cotización, Reparación o Terminado)
      </Typography>
    </Box>
  );
}
