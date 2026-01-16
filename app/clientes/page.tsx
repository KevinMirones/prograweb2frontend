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

// 🔹 Interfaz de cliente basada en tu API
interface Cliente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  created_at: string;
}

export default function ClientesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://172.25.2.45:8080/api/v1/clientes";

  // 🔄 Cargar clientes desde la API
  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setClientes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar clientes");
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // ❌ Eliminar cliente
  const eliminarCliente = async (id: number) => {
    if (!confirm("¿Deseas eliminar este cliente?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(result.msg || "Cliente eliminado exitosamente");
      cargarClientes(); // Recargar la lista
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar cliente"
      );
      console.error("Error eliminando cliente:", err);
    }
  };

  // 👁️ Ver detalles del cliente
  const verCliente = (id: number) => {
    router.push(`/clientes/formulario?id=${id}&accion=ver`);
  };

  // ✏️ Editar cliente
  const editarCliente = (id: number) => {
    router.push(`/clientes/formulario?id=${id}&accion=editar`);
  };

  // ➕ Nuevo cliente
  const nuevoCliente = () => {
    router.push("/clientes/formulario?accion=nuevo");
  };

  // 🔍 Filtrar clientes según búsqueda
  const filtered = clientes.filter(
    (cliente) =>
      cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido_paterno
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cliente.apellido_materno
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cliente.telefono?.includes(searchTerm) ||
      cliente.id?.toString().includes(searchTerm)
  );

  // Función para formatear nombre completo
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
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#00897b" }}>
          Gestión de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            backgroundColor: "#00897b",
            "&:hover": { backgroundColor: "#00695c" },
          }}
          onClick={nuevoCliente}
        >
          Nuevo Cliente
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
          <CircularProgress sx={{ color: "#00897b" }} />
        </Box>
      ) : (
        /* Tabla de clientes */
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#00897b" }}>
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
                  Fecha de Registro
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((cliente) => (
                  <TableRow key={cliente.id} hover>
                    <TableCell>{cliente.id}</TableCell>
                    <TableCell>{getNombreCompleto(cliente)}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{formatearFecha(cliente.created_at)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => verCliente(cliente.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => editarCliente(cliente.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => eliminarCliente(cliente.id)}
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
                      ? "No se encontraron clientes que coincidan con la búsqueda."
                      : "No hay clientes registrados."}
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
