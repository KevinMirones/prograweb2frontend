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
import AssignmentIcon from "@mui/icons-material/Assignment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// 🔹 Interfaces basadas en tu API
interface Tecnico {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  fecha_ingreso: string;
}

interface Trabajo {
  id_tra: number;
  descripcion: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo: number;
  tecnico: Tecnico;
}

export default function TrabajosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/trabajos`;

  // 🔄 Cargar trabajos desde la API
  const cargarTrabajos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTrabajos(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar trabajos");
      console.error("Error cargando trabajos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTrabajos();
  }, []);

  // ❌ Eliminar trabajo
  const eliminarTrabajo = async (id: number) => {
    if (!confirm("¿Deseas eliminar este trabajo?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(result.msg || "Trabajo eliminado exitosamente");
      cargarTrabajos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar trabajo"
      );
      console.error("Error eliminando trabajo:", err);
    }
  };

  // 👁️ Ver detalles del trabajo
  const verTrabajo = (id: number) => {
    router.push(`/trabajos/formulario?id=${id}&accion=ver`);
  };

  // ✏️ Editar trabajo
  const editarTrabajo = (id: number) => {
    router.push(`/trabajos/formulario?id=${id}&accion=editar`);
  };

  // ➕ Nuevo trabajo
  const nuevoTrabajo = () => {
    router.push("/trabajos/formulario?accion=nuevo");
  };

  // 🔗 Asignar a cotización
  const asignarCotizacion = (id: number) => {
    router.push(`/trabajos/formulario?id=${id}&accion=asignar`);
  };

  // 🔍 Filtrar trabajos según búsqueda
  const filtered = trabajos.filter(
    (trabajo) =>
      trabajo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabajo.tecnico.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      trabajo.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabajo.id_tra?.toString().includes(searchTerm)
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
      month: "short",
      day: "numeric",
    });
  };

  // Función para obtener nombre completo
  const getNombreCompleto = (tecnico: Tecnico) => {
    return `${tecnico.nombre} ${tecnico.apellido_paterno} ${tecnico.apellido_materno}`.trim();
  };

  // Función para obtener color del estado
  const getColorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "warning";
      case "en progreso":
        return "info";
      case "completado":
        return "success";
      case "cancelado":
        return "error";
      default:
        return "default";
    }
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  // Calcular estadísticas
  const estadisticas = {
    total: trabajos.length,
    completados: trabajos.filter((t) => t.estado.toLowerCase() === "completado")
      .length,
    enProgreso: trabajos.filter((t) => t.estado.toLowerCase() === "en progreso")
      .length,
    ingresosTotales: trabajos.reduce((sum, t) => sum + t.costo, 0),
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
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#f57c00" }}>
          Gestión de Trabajos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            backgroundColor: "#f57c00",
            "&:hover": { backgroundColor: "#e65100" },
            px: 3,
            py: 1,
          }}
          onClick={nuevoTrabajo}
        >
          Nuevo Trabajo
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#fff3e0" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Trabajos
              </Typography>
              <Typography variant="h4" color="#f57c00" fontWeight="bold">
                {estadisticas.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#e8f5e8" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completados
              </Typography>
              <Typography variant="h4" color="#2e7d32" fontWeight="bold">
                {estadisticas.completados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#e3f2fd" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                En Progreso
              </Typography>
              <Typography variant="h4" color="#1976d2" fontWeight="bold">
                {estadisticas.enProgreso}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#fce4ec" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Ingresos Totales
              </Typography>
              <Typography variant="h6" color="#c2185b" fontWeight="bold">
                {formatearPrecio(estadisticas.ingresosTotales)}
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
          placeholder="Buscar por descripción, técnico, estado o ID..."
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
          <CircularProgress sx={{ color: "#f57c00" }} />
        </Box>
      ) : (
        /* Tabla de trabajos */
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: 3 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f57c00" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Descripción
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Técnico
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Fechas
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Costo
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((trabajo) => (
                  <TableRow key={trabajo.id_tra} hover>
                    <TableCell>
                      <Typography fontWeight="bold" color="#f57c00">
                        #{trabajo.id_tra}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {trabajo.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getNombreCompleto(trabajo.tecnico)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {trabajo.tecnico.telefono}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trabajo.estado}
                        color={getColorEstado(trabajo.estado) as any}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          Inicio: {formatearFecha(trabajo.fecha_inicio)}
                        </Typography>
                        {trabajo.fecha_fin && (
                          <Typography variant="body2">
                            <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            Fin: {formatearFecha(trabajo.fecha_fin)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<AttachMoneyIcon />}
                        label={formatearPrecio(trabajo.costo)}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <IconButton
                          color="info"
                          onClick={() => verTrabajo(trabajo.id_tra)}
                          title="Ver detalles"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="warning"
                          onClick={() => editarTrabajo(trabajo.id_tra)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => asignarCotizacion(trabajo.id_tra)}
                          title="Asignar a cotización"
                        >
                          <AssignmentIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => eliminarTrabajo(trabajo.id_tra)}
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
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      {searchTerm
                        ? "No se encontraron trabajos que coincidan con la búsqueda."
                        : "No hay trabajos registrados."}
                    </Typography>
                    {!searchTerm && (
                      <Button
                        variant="contained"
                        startIcon={<AddBoxIcon />}
                        sx={{ mt: 2, backgroundColor: "#f57c00" }}
                        onClick={nuevoTrabajo}
                      >
                        Crear Primer Trabajo
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
