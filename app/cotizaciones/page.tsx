"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Divider,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

import AddBoxIcon from "@mui/icons-material/AddBox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// 🔹 Interfaces basadas en tu API
interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion: string;
}

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

export default function CotizacionesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cotizaciones`;

  // 🔄 Cargar cotizaciones desde la API
  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCotizaciones(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar cotizaciones"
      );
      console.error("Error cargando cotizaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  // ❌ Eliminar cotización
  const eliminarCotizacion = async (id: number) => {
    if (!confirm("¿Deseas eliminar esta cotización?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(result.msg || "Cotización eliminada exitosamente");
      cargarCotizaciones();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar cotización"
      );
      console.error("Error eliminando cotización:", err);
    }
  };

  // 👁️ Ver detalles de la cotización
  const verCotizacion = (id: number) => {
    router.push(`/cotizaciones/formulario?id=${id}&accion=ver`);
  };

  // ✏️ Editar cotización
  const editarCotizacion = (id: number) => {
    router.push(`/cotizaciones/formulario?id=${id}&accion=editar`);
  };

  // ➕ Nueva cotización
  const nuevaCotizacion = () => {
    router.push("/cotizaciones/formulario?accion=nuevo");
  };

  // 🖨️ Imprimir cotización
  const imprimirCotizacion = (id: number) => {
    window.open(`/cotizaciones/imprimir?id=${id}`, "_blank");
  };

  // 🔍 Filtrar cotizaciones según búsqueda
  const filtered = cotizaciones.filter(
    (cotizacion) =>
      cotizacion.cliente.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cotizacion.equipo.marca
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cotizacion.equipo.modelo
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cotizacion.tecnico.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cotizacion.descripcion_falla
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cotizacion.id?.toString().includes(searchTerm)
  );

  // Función para formatear precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(precio);
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para obtener nombre completo
  const getNombreCompleto = (persona: Cliente | Tecnico) => {
    return `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`.trim();
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  // Función para obtener color del estado
  const getColorEstado = (estado: string) => {
    switch (estado) {
      case "Abierta":
        return "primary";
      case "Aprobada":
        return "success";
      case "Rechazada":
        return "error";
      case "Expirada":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Notificaciones */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Encabezado */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#7b1fa2" }}>
          Gestión de Cotizaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            backgroundColor: "#7b1fa2",
            "&:hover": { backgroundColor: "#6a1b9a" },
            px: 3,
            py: 1,
          }}
          onClick={nuevaCotizacion}
        >
          Nueva Cotización
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#f3e5f5" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Cotizaciones
              </Typography>
              <Typography variant="h4" color="#7b1fa2" fontWeight="bold">
                {cotizaciones.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#e8f5e8" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Abiertas
              </Typography>
              <Typography variant="h4" color="#2e7d32" fontWeight="bold">
                {cotizaciones.filter((c) => c.estado === "Abierta").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#fff3e0" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Posible Ingreso Total
              </Typography>
              <Typography variant="h6" color="#ef6c00" fontWeight="bold">
                {formatearPrecio(
                  cotizaciones.reduce((sum, c) => sum + c.precio_total, 0)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de búsqueda */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <SearchIcon color="action" />
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por cliente, equipo, técnico, falla o ID..."
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Contenido */}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: 200 }}
        >
          <CircularProgress sx={{ color: "#7b1fa2" }} />
        </Box>
      ) : (
        /* Tabla de cotizaciones */
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: 3 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#7b1fa2" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Cliente
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Equipo
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Falla
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Técnico
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Precio Total
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Expiración
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((cotizacion) => (
                  <TableRow key={cotizacion.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold" color="#7b1fa2">
                        #{cotizacion.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {getNombreCompleto(cotizacion.cliente)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cotizacion.cliente.telefono}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {cotizacion.equipo.marca} {cotizacion.equipo.modelo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cotizacion.equipo.tipo_equipo.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cotizacion.descripcion_falla}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getNombreCompleto(cotizacion.tecnico)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cotizacion.estado}
                        color={getColorEstado(cotizacion.estado) as any}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<AttachMoneyIcon />}
                        label={formatearPrecio(cotizacion.precio_total)}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatearFecha(cotizacion.fecha_expiracion)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <IconButton
                          color="info"
                          onClick={() => verCotizacion(cotizacion.id)}
                          title="Ver detalles"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="warning"
                          onClick={() => editarCotizacion(cotizacion.id)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="success"
                          onClick={() => imprimirCotizacion(cotizacion.id)}
                          title="Imprimir"
                        >
                          <PrintIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => eliminarCotizacion(cotizacion.id)}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      {searchTerm
                        ? "No se encontraron cotizaciones que coincidan con la búsqueda."
                        : "No hay cotizaciones registradas."}
                    </Typography>
                    {!searchTerm && (
                      <Button
                        variant="contained"
                        startIcon={<AddBoxIcon />}
                        sx={{ mt: 2, backgroundColor: "#7b1fa2" }}
                        onClick={nuevaCotizacion}
                      >
                        Crear Primera Cotización
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
