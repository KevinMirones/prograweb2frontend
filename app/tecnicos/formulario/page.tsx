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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

interface Tecnico {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  fecha_ingreso: string;
}

interface TecnicoForm {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  fecha_ingreso: string;
}

export default function FormularioTecnicoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const accion = searchParams?.get("accion") || "nuevo";

  const [tecnico, setTecnico] = useState<TecnicoForm>({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    fecha_ingreso: new Date().toISOString().split("T")[0], // Fecha actual por defecto
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tecnicos`;

  // Cargar datos del técnico si es edición o visualización
  useEffect(() => {
    if (id && accion !== "nuevo") {
      cargarTecnico();
    }
  }, [id, accion]);

  const cargarTecnico = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const tecnicoData = data.data;

      // Formatear fecha para el input type="date"
      const fechaIngreso = new Date(tecnicoData.fecha_ingreso)
        .toISOString()
        .split("T")[0];

      setTecnico({
        nombre: tecnicoData.nombre,
        apellido_paterno: tecnicoData.apellido_paterno,
        apellido_materno: tecnicoData.apellido_materno,
        telefono: tecnicoData.telefono,
        fecha_ingreso: fechaIngreso,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar técnico");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTecnico((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (
      !tecnico.nombre ||
      !tecnico.apellido_paterno ||
      !tecnico.telefono ||
      !tecnico.fecha_ingreso
    ) {
      setError(
        "Nombre, apellido paterno, teléfono y fecha de ingreso son requeridos"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      let response;

      // Formatear fecha para la API (formato ISO)
      const fechaIngresoISO = new Date(tecnico.fecha_ingreso).toISOString();

      if (accion === "nuevo") {
        // CREAR nuevo técnico
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...tecnico,
            fecha_ingreso: fechaIngresoISO,
          }),
        });
      } else if (accion === "editar" && id) {
        // ACTUALIZAR técnico existente
        response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...tecnico,
            fecha_ingreso: fechaIngresoISO,
          }),
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
            ? "Técnico creado exitosamente"
            : "Técnico actualizado exitosamente")
      );

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/tecnicos");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar técnico");
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = accion === "ver";
  const title =
    accion === "nuevo"
      ? "Nuevo Técnico"
      : accion === "editar"
      ? "Editar Técnico"
      : "Ver Técnico";

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/tecnicos")}
          sx={{ color: "#ed6c02" }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#ed6c02" }}>
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
            <CircularProgress sx={{ color: "#ed6c02" }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={tecnico.nombre}
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
                  value={tecnico.apellido_paterno}
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
                  value={tecnico.apellido_materno}
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
                  value={tecnico.telefono}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                />
              </Grid>

              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Fecha de Ingreso"
                  name="fecha_ingreso"
                  type="date"
                  value={tecnico.fecha_ingreso}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {!isViewMode && (
                <Grid xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.push("/tecnicos")}
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
                        backgroundColor: "#ed6c02",
                        "&:hover": { backgroundColor: "#e65100" },
                      }}
                    >
                      {accion === "nuevo"
                        ? "Crear Técnico"
                        : "Actualizar Técnico"}
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
