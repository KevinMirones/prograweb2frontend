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
} from "@mui/material";

import AddBoxIcon from "@mui/icons-material/AddBox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// 🔹 Interfaz de servicio basada en tu API
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

export default function ServiciosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://172.25.2.45:8080/api/v1/servicios";

  // 🔄 Cargar servicios desde la API
  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setServicios(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar servicios"
      );
      console.error("Error cargando servicios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // ❌ Eliminar servicio
  const eliminarServicio = async (id: number) => {
    if (!confirm("¿Deseas eliminar este servicio?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(result.msg || "Servicio eliminado exitosamente");
      cargarServicios(); // Recargar la lista
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar servicio"
      );
      console.error("Error eliminando servicio:", err);
    }
  };

  // 👁️ Ver detalles del servicio
  const verServicio = (id: number) => {
    router.push(`/servicios/formulario?id=${id}&accion=ver`);
  };

  // ✏️ Editar servicio
  const editarServicio = (id: number) => {
    router.push(`/servicios/formulario?id=${id}&accion=editar`);
  };

  // ➕ Nuevo servicio
  const nuevoServicio = () => {
    router.push("/servicios/formulario?accion=nuevo");
  };

  // 🔍 Filtrar servicios según búsqueda
  const filtered = servicios.filter(
    (servicio) =>
      servicio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.precio?.toString().includes(searchTerm) ||
      servicio.id?.toString().includes(searchTerm)
  );

  // Función para formatear precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(precio);
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
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
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#2e7d32" }}>
          Gestión de Servicios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            backgroundColor: "#2e7d32",
            "&:hover": { backgroundColor: "#1b5e20" },
          }}
          onClick={nuevoServicio}
        >
          Nuevo Servicio
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Barra de búsqueda */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <SearchIcon color="action" />
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por nombre, descripción, precio o ID..."
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
          <CircularProgress sx={{ color: "#2e7d32" }} />
        </Box>
      ) : (
        /* Tabla de servicios */
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#2e7d32" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Descripción
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Precio
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((servicio) => (
                  <TableRow key={servicio.id} hover>
                    <TableCell>{servicio.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {servicio.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {servicio.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<AttachMoneyIcon />}
                        label={formatearPrecio(servicio.precio)}
                        size="small"
                        color="success"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => verServicio(servicio.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => editarServicio(servicio.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => eliminarServicio(servicio.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {searchTerm
                      ? "No se encontraron servicios que coincidan con la búsqueda."
                      : "No hay servicios registrados."}
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
