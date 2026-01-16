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
} from "@mui/material";

import AddBoxIcon from "@mui/icons-material/AddBox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

// 🔹 Interfaz de técnico basada en tu API
interface Tecnico {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  fecha_ingreso: string;
}

export default function TecnicosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://172.25.2.45:8080/api/v1/tecnicos";

  // 🔄 Cargar técnicos desde la API
  const cargarTecnicos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTecnicos(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar técnicos");
      console.error("Error cargando técnicos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTecnicos();
  }, []);

  // ❌ Eliminar técnico
  const eliminarTecnico = async (id: number) => {
    if (!confirm("¿Deseas eliminar este técnico?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(result.msg || "Técnico eliminado exitosamente");
      cargarTecnicos(); // Recargar la lista
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar técnico"
      );
      console.error("Error eliminando técnico:", err);
    }
  };

  // 👁️ Ver detalles del técnico
  const verTecnico = (id: number) => {
    router.push(`/tecnicos/formulario?id=${id}&accion=ver`);
  };

  // ✏️ Editar técnico
  const editarTecnico = (id: number) => {
    router.push(`/tecnicos/formulario?id=${id}&accion=editar`);
  };

  // ➕ Nuevo técnico
  const nuevoTecnico = () => {
    router.push("/tecnicos/formulario?accion=nuevo");
  };

  // 🔍 Filtrar técnicos según búsqueda
  const filtered = tecnicos.filter(
    (tecnico) =>
      tecnico.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tecnico.apellido_paterno
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tecnico.apellido_materno
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tecnico.telefono?.includes(searchTerm) ||
      tecnico.id?.toString().includes(searchTerm)
  );

  // Función para formatear nombre completo
  const getNombreCompleto = (tecnico: Tecnico) => {
    return `${tecnico.nombre} ${tecnico.apellido_paterno} ${tecnico.apellido_materno}`.trim();
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES");
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
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#ed6c02" }}>
          Gestión de Técnicos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            backgroundColor: "#ed6c02",
            "&:hover": { backgroundColor: "#e65100" },
          }}
          onClick={nuevoTecnico}
        >
          Nuevo Técnico
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Barra de búsqueda */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <SearchIcon color="action" />
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por nombre, apellido, teléfono o ID..."
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
          <CircularProgress sx={{ color: "#ed6c02" }} />
        </Box>
      ) : (
        /* Tabla de técnicos */
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#ed6c02" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Nombre Completo
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Teléfono
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Fecha de Ingreso
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((tecnico) => (
                  <TableRow key={tecnico.id} hover>
                    <TableCell>{tecnico.id}</TableCell>
                    <TableCell>{getNombreCompleto(tecnico)}</TableCell>
                    <TableCell>{tecnico.telefono}</TableCell>
                    <TableCell>
                      {formatearFecha(tecnico.fecha_ingreso)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => verTecnico(tecnico.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => editarTecnico(tecnico.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => eliminarTecnico(tecnico.id)}
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
                      ? "No se encontraron técnicos que coincidan con la búsqueda."
                      : "No hay técnicos registrados."}
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
