"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

// Interfaces
interface Cliente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  created_at: string;
}

interface Tecnico {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  fecha_ingreso: string;
}

interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Equipo {
  id: number;
  marca: string;
  modelo: string;
  estado: string;
  tipo_equipo: TipoEquipo;
  dueno: Cliente;
  created_at: string;
}

interface Cotizacion {
  id: number;
  descripcion_falla: string;
  diagnostico: string;
  fecha_expiracion: string;
  tecnico: Tecnico;
  estado: string;
  precio_total: number;
  equipo: Equipo;
  cliente: Cliente;
  servicios: any;
  created_at: string;
  id_trabajo: number | null;
}

// Componente que usa useSearchParams
function ImprimirCotizacionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      cargarCotizacion();
    }
  }, [id]);

  const cargarCotizacion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cotizaciones/${id}`
      );
      if (!response.ok) throw new Error("Error al cargar cotización");

      const data = await response.json();
      setCotizacion(data.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-content");
    const printWindow = window.open("", "_blank");

    if (printWindow && printContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cotización #${cotizacion?.id}</title>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 20px; 
                color: #333;
                background: white;
              }
              .print-container { 
                max-width: 800px; 
                margin: 0 auto; 
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
                border-bottom: 2px solid #7b1fa2;
                padding-bottom: 20px;
              }
              .section { 
                margin-bottom: 25px; 
              }
              .section-title { 
                border-bottom: 1px solid #7b1fa2; 
                padding-bottom: 5px; 
                margin-bottom: 15px;
                color: #7b1fa2;
                font-size: 18px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 10px; 
                text-align: left;
              }
              th { 
                background-color: #f5f5f5; 
                font-weight: bold;
              }
              .total-row { 
                background-color: #f8f8f8; 
                font-weight: bold;
              }
              .terms { 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px dashed #ccc; 
                font-size: 12px;
                text-align: center;
              }
              .signatures { 
                margin-top: 50px; 
                display: flex; 
                justify-content: space-between;
              }
              .signature-box { 
                text-align: center; 
                width: 45%; 
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Esperar a que se cargue el contenido antes de imprimir
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleBack = () => {
    router.push("/cotizaciones");
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(precio);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getNombreCompleto = (persona: Cliente | Tecnico) => {
    return `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`.trim();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!cotizacion) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cotización no encontrada</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Controles - No se imprimen */}
      <Box className="no-print" sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Volver
        </Button>
        <Button
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          variant="contained"
          sx={{ backgroundColor: "#7b1fa2" }}
        >
          Imprimir
        </Button>
      </Box>

      {/* Contenido imprimible */}
      <Paper
        id="printable-content"
        sx={{ p: 4, maxWidth: 800, margin: "0 auto" }}
      >
        {/* Encabezado */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#7b1fa2"
            gutterBottom
          >
            COTIZACIÓN DE SERVICIO
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Número de Cotización: #{cotizacion.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fecha de emisión: {formatearFecha(cotizacion.created_at)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Información del Cliente y Equipo */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ borderBottom: "2px solid", borderColor: "#7b1fa2", pb: 1 }}
            >
              Información del Cliente
            </Typography>
            <Typography>
              <strong>Nombre:</strong> {getNombreCompleto(cotizacion.cliente)}
            </Typography>
            <Typography>
              <strong>Teléfono:</strong> {cotizacion.cliente.telefono}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ borderBottom: "2px solid", borderColor: "#7b1fa2", pb: 1 }}
            >
              Información del Equipo
            </Typography>
            <Typography>
              <strong>Equipo:</strong> {cotizacion.equipo.marca}{" "}
              {cotizacion.equipo.modelo}
            </Typography>
            <Typography>
              <strong>Tipo:</strong> {cotizacion.equipo.tipo_equipo.nombre}
            </Typography>
            <Typography>
              <strong>Estado actual:</strong> {cotizacion.equipo.estado}
            </Typography>
          </Grid>
        </Grid>

        {/* Descripción del Servicio */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ borderBottom: "2px solid", borderColor: "#7b1fa2", pb: 1 }}
          >
            Descripción del Servicio
          </Typography>

          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Falla Reportada por el Cliente:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "#f8f8f8",
                borderRadius: 1,
                borderLeft: "4px solid #7b1fa2",
              }}
            >
              <Typography sx={{ fontStyle: "italic" }}>
                {cotizacion.descripcion_falla}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Diagnóstico y Solución Propuesta:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "#f0f8ff",
                borderRadius: 1,
                borderLeft: "4px solid #2196f3",
              }}
            >
              <Typography>{cotizacion.diagnostico}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Información Técnica */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ borderBottom: "2px solid", borderColor: "#7b1fa2", pb: 1 }}
            >
              Responsable Técnico
            </Typography>
            <Typography>
              <strong>Nombre:</strong> {getNombreCompleto(cotizacion.tecnico)}
            </Typography>
            <Typography>
              <strong>Teléfono:</strong> {cotizacion.tecnico.telefono}
            </Typography>
            <Typography>
              <strong>Fecha de ingreso:</strong>{" "}
              {formatearFecha(cotizacion.tecnico.fecha_ingreso)}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ borderBottom: "2px solid", borderColor: "#7b1fa2", pb: 1 }}
            >
              Validez de la Cotización
            </Typography>
            <Typography>
              <strong>Fecha de expiración:</strong>{" "}
              {formatearFecha(cotizacion.fecha_expiracion)}
            </Typography>
            <Typography>
              <strong>Estado actual:</strong> {cotizacion.estado}
            </Typography>
            {cotizacion.id_trabajo && (
              <Typography>
                <strong>Número de trabajo:</strong> #{cotizacion.id_trabajo}
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Resumen de Costos */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ borderBottom: "2px solid", borderColor: "#7b1fa2", pb: 1 }}
          >
            Detalle de Costos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Descripción del Servicio
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Precio
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    Servicio de reparación técnica especializada
                    <br />
                    <Typography variant="body2" color="text.secondary">
                      Incluye: diagnóstico, mano de obra y garantía de 30 días
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: "16px", fontWeight: "bold" }}
                  >
                    {formatearPrecio(cotizacion.precio_total)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f8f8f8" }}>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                    TOTAL A PAGAR
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      color: "#7b1fa2",
                    }}
                  >
                    {formatearPrecio(cotizacion.precio_total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Términos y Condiciones */}
        <Box sx={{ mt: 6, pt: 3, borderTop: "1px dashed #ccc" }}>
          <Typography variant="h6" gutterBottom align="center">
            Términos y Condiciones
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Validez:</strong> Esta cotización es válida hasta{" "}
            {formatearFecha(cotizacion.fecha_expiracion)}
            <br />
            <strong>Pagos:</strong> Se requiere 50% de anticipo para iniciar el
            trabajo
            <br />
            <strong>Garantía:</strong> 30 días en mano de obra. No cubre daños
            por mal uso
            <br />
            <strong>Tiempos de entrega:</strong> Sujetos a disponibilidad de
            repuestos
            <br />
            <strong>Almacenamiento:</strong> Equipos no reclamados en 30 días
            incurrirán en cargos de almacenamiento
          </Typography>
        </Box>

        {/* Firmas */}
        <Grid
          container
          spacing={4}
          sx={{ mt: 4, pt: 4, borderTop: "1px dashed #ccc" }}
        >
          <Grid size={{ xs: 6 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
                _________________________
                <br />
                <strong>Firma del Cliente</strong>
                <br />
                Aceptación de términos y condiciones
              </Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {getNombreCompleto(cotizacion.cliente)}
                <br />
                <strong>Fecha:</strong> _________________________
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
                _________________________
                <br />
                <strong>Firma del Técnico</strong>
                <br />
                Responsable del servicio
              </Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {getNombreCompleto(cotizacion.tecnico)}
                <br />
                <strong>Fecha:</strong> _________________________
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Pie de página */}
        <Box sx={{ mt: 6, pt: 3, borderTop: "1px solid #ccc" }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Taller de Reparaciones Técnicas</strong>
            <br />
            Teléfono: [Tu número] | Email: [Tu email] | Dirección: [Tu
            dirección]
            <br />
            Gracias por confiar en nuestros servicios
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

// Componente principal con Suspense
export default function ImprimirCotizacionPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#7b1fa2" }} />
      </Box>
    }>
      <ImprimirCotizacionContent />
    </Suspense>
  );
}