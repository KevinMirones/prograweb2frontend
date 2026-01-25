"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@mui/material";

import AddBoxIcon from "@mui/icons-material/AddBox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

// 🔹 Interfaz de registro
interface Registro {
  id: string;
  cliente: string;
  detalle: string;
  estado: string;
  tipo: "Reparacion" | "Terminado" | "Otro";
}

function TerminadoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [terminados, setTerminados] = useState<Registro[]>([]);

  // 🔄 Cargar trabajos terminados desde localStorage
  const cargarTerminados = () => {
    const datos: Registro[] = JSON.parse(
      localStorage.getItem("registros") || "[]"
    );

    // Solo mostrar registros de tipo "Terminado"
    const filtrados = datos.filter((r) => r.tipo === "Terminado");
    setTerminados(filtrados);
  };

  useEffect(() => {
    cargarTerminados();
  }, [searchParams?.get("recargar")]);

  // 🔍 Filtrar según búsqueda
  const filtered = terminados.filter(
    (item) =>
      item.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detalle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.includes(searchTerm)
  );

  // ❌ Eliminar registro
  const eliminarTerminado = (id: string) => {
    if (!confirm("¿Deseas eliminar este registro?")) return;

    const todos: Registro[] = JSON.parse(
      localStorage.getItem("registros") || "[]"
    );
    const actualizados = todos.filter((r) => r.id !== id);

    localStorage.setItem("registros", JSON.stringify(actualizados));
    cargarTerminados();
  };

  // 👁️ Ver detalles
  const verTerminado = (id: string) => {
    router.push(`/formularios?id=${id}&accion=ver`);
  };

  // ✏️ Editar registro
  const editarTerminado = (id: string) => {
    router.push(`/formularios?id=${id}&accion=editar`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#00897b" }}>
          Trabajos Terminados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            backgroundColor: "#00897b",
            "&:hover": { backgroundColor: "#00695c" },
          }}
          onClick={() => router.push("/formularios?recargar=true")}
        >
          Nuevo Registro
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Barra de búsqueda */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <SearchIcon color="action" />
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por cliente, detalle o número..."
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#00897b" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                ID
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Cliente
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Detalle
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Estado
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.cliente}</TableCell>
                  <TableCell>{row.detalle}</TableCell>
                  <TableCell>{row.estado}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => verTerminado(row.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="warning"
                      onClick={() => editarTerminado(row.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => eliminarTerminado(row.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay trabajos terminados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default function TerminadoPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress sx={{ color: "#00897b" }} />
        </Box>
      }
    >
      <TerminadoContent />
    </Suspense>
  );
}