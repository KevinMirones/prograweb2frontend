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

interface Equipo {
  id: number;
  marca: string;
  modelo: string;
  estado?: string;
  tipo_equipo: TipoEquipo;
  dueno: Cliente;
  created_at: string;
}

export default function EquiposPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipos`;

  // 🔄 Cargar equipos desde la API
  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEquipos(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar equipos");
      console.error("Error cargando equipos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  // ❌ Eliminar equipo
  const eliminarEquipo = async (id: number) => {
    if (!confirm("¿Deseas eliminar este equipo?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(result.msg || "Equipo eliminado exitosamente");
      cargarEquipos(); // Recargar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar equipo");
      console.error("Error eliminando equipo:", err);
    }
  };

  // 👁️ Ver detalles del equipo
  const verEquipo = (id: number) => {
    router.push(`/equipos/formulario?id=${id}&accion=ver`);
  };

  // ✏️ Editar equipo
  const editarEquipo = (id: number) => {
    router.push(`/equipos/formulario?id=${id}&accion=editar`);
  };

  // ➕ Nuevo equipo
  const nuevoEquipo = () => {
    router.push("/equipos/formulario?accion=nuevo");
  };

  // 🔍 Filtrar equipos según búsqueda
  const filtered = equipos.filter(
    (equipo) =>
      equipo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.tipo_equipo.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${equipo.dueno.nombre} ${equipo.dueno.apellido_paterno}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      equipo.id?.toString().includes(searchTerm)
  );

  // Función para obtener nombre completo del dueño
  const getNombreCompleto = (cliente: Cliente) => {
    return `${cliente.nombre} ${cliente.apellido_paterno} ${cliente.apellido_materno}`.trim();
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
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#1976d2" }}>
          Gestión de Equipos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
          onClick={nuevoEquipo}
        >
          Nuevo Equipo
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Barra de búsqueda */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <SearchIcon color="action" />
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por marca, modelo, tipo, dueño o ID..."
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
          <CircularProgress sx={{ color: "#1976d2" }} />
        </Box>
      ) : (
        /* Tabla de equipos */
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Marca
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Modelo
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Dueño
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Fecha Registro
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((equipo) => (
                  <TableRow key={equipo.id} hover>
                    <TableCell>{equipo.id}</TableCell>
                    <TableCell>{equipo.marca}</TableCell>
                    <TableCell>{equipo.modelo}</TableCell>
                    <TableCell>
                      <Chip
                        label={equipo.tipo_equipo.nombre}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{getNombreCompleto(equipo.dueno)}</TableCell>
                    <TableCell>
                      <Chip
                        label={equipo.estado || "Pendiente"}
                        size="small"
                        color={
                          equipo.estado === "Reparado" ||
                          equipo.estado === "Entregado"
                            ? "success"
                            : equipo.estado === "En Reparación"
                            ? "warning"
                            : equipo.estado === "Cancelado"
                            ? "error"
                            : "default"
                        }
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{formatearFecha(equipo.created_at)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => verEquipo(equipo.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => editarEquipo(equipo.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => eliminarEquipo(equipo.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {searchTerm
                      ? "No se encontraron equipos que coincidan con la búsqueda."
                      : "No hay equipos registrados."}
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
