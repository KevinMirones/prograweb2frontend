"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

interface ServicioForm {
  nombre: string;
  descripcion: string;
  precio: number;
}

export default function FormularioServicioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const accion = searchParams?.get("accion") || "nuevo";

  const [servicio, setServicio] = useState<ServicioForm>({
    nombre: "",
    descripcion: "",
    precio: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/servicios`;

  // Cargar datos del servicio si es edición o visualización
  useEffect(() => {
    if (id && accion !== "nuevo") {
      cargarServicio();
    }
  }, [id, accion]);

  const cargarServicio = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const servicioData = data.data;

      setServicio({
        nombre: servicioData.nombre,
        descripcion: servicioData.descripcion,
        precio: servicioData.precio,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar servicio");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "precio") {
      // Para el precio, convertir a número y validar que sea positivo
      const precioValue = parseFloat(value) || 0;
      setServicio((prev) => ({
        ...prev,
        [name]: Math.max(0, precioValue), // No permitir valores negativos
      }));
    } else {
      setServicio((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!servicio.nombre.trim()) {
      setError("El nombre del servicio es requerido");
      return;
    }

    if (!servicio.descripcion.trim()) {
      setError("La descripción del servicio es requerida");
      return;
    }

    if (servicio.precio <= 0) {
      setError("El precio debe ser mayor a 0");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let response;

      if (accion === "nuevo") {
        // CREAR nuevo servicio
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(servicio),
        });
      } else if (accion === "editar" && id) {
        // ACTUALIZAR servicio existente
        response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(servicio),
        });
      }

      if (!response?.ok) {
        const errorData = await response?.json();
        throw new Error(
          errorData?.detail?.[0]?.msg ||
            `Error ${response?.status}: ${response?.statusText}`
        );
      }

      const result = await response.json();
      setSuccess(
        result.msg ||
          (accion === "nuevo"
            ? "Servicio creado exitosamente"
            : "Servicio actualizado exitosamente")
      );

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/servicios");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar servicio"
      );
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = accion === "ver";
  const title =
    accion === "nuevo"
      ? "Nuevo Servicio"
      : accion === "editar"
      ? "Editar Servicio"
      : "Ver Servicio";

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/servicios")}
          sx={{ color: "#2e7d32" }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#2e7d32" }}>
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
            <CircularProgress sx={{ color: "#2e7d32" }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Servicio"
                  name="nombre"
                  value={servicio.nombre}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                  placeholder="Ej: Mantenimiento Preventivo, Reparación, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={servicio.descripcion}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  multiline
                  rows={4}
                  variant={isViewMode ? "filled" : "outlined"}
                  placeholder="Describe detalladamente el servicio que se ofrece..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio"
                  name="precio"
                  type="number"
                  value={servicio.precio}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: {
                      min: 0,
                      step: 0.01,
                    },
                  }}
                  helperText="Precio en Bolivianos (BOB)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Precio formateado:
                  </Typography>
                  <Typography variant="h6" color="#2e7d32" fontWeight="bold">
                    {new Intl.NumberFormat("es-BO", {
                      style: "currency",
                      currency: "BOB",
                    }).format(servicio.precio)}
                  </Typography>
                </Box>
              </Grid>

              {!isViewMode && (
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.push("/servicios")}
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
                        backgroundColor: "#2e7d32",
                        "&:hover": { backgroundColor: "#1b5e20" },
                      }}
                    >
                      {accion === "nuevo"
                        ? "Crear Servicio"
                        : "Actualizar Servicio"}
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
