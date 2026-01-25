"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

interface Cliente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  created_at: string;
}

export default function FormularioClientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const accion = searchParams?.get("accion") || "nuevo";

  const [cliente, setCliente] = useState<Omit<Cliente, "id" | "created_at">>({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/clientes`;

  // Cargar datos del cliente si es edición o visualización
  useEffect(() => {
    if (id && accion !== "nuevo") {
      cargarCliente();
    }
  }, [id, accion]);

  const cargarCliente = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCliente({
        nombre: data.data.nombre,
        apellido_paterno: data.data.apellido_paterno,
        apellido_materno: data.data.apellido_materno,
        telefono: data.data.telefono,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      let response;

      if (accion === "nuevo") {
        // CREAR nuevo cliente
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cliente),
        });
      } else if (accion === "editar" && id) {
        // ACTUALIZAR cliente existente
        response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cliente),
        });
      }

      if (!response?.ok) {
        throw new Error(`Error ${response?.status}: ${response?.statusText}`);
      }

      const result = await response.json();
      setSuccess(
        result.msg ||
          (accion === "nuevo"
            ? "Cliente creado exitosamente"
            : "Cliente actualizado exitosamente")
      );

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/clientes");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cliente");
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = accion === "ver";
  const title =
    accion === "nuevo"
      ? "Nuevo Cliente"
      : accion === "editar"
      ? "Editar Cliente"
      : "Ver Cliente";

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/clientes")}
          sx={{ color: "#00897b" }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#00897b" }}>
          {title}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Formulario */}
      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {loading && accion !== "nuevo" ? (
          <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress sx={{ color: "#00897b" }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={cliente.nombre}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                />
              </Grid>
          
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido Paterno"
                  name="apellido_paterno"
                  value={cliente.apellido_paterno}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido Materno"
                  name="apellido_materno"
                  value={cliente.apellido_materno}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  variant={isViewMode ? "filled" : "outlined"}
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={cliente.telefono}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                />
              </Grid>

              {!isViewMode && (
                <Grid xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.push("/clientes")}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        loading ? <CircularProgress size={20} /> : <SaveIcon />
                      }
                      disabled={loading}
                      sx={{
                        backgroundColor: "#00897b",
                        "&:hover": { backgroundColor: "#00695c" },
                      }}
                    >
                      {accion === "nuevo"
                        ? "Crear Cliente"
                        : "Actualizar Cliente"}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </Paper>
    </Box>
  );
}
