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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

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
  estado: string;
  tipo_equipo: TipoEquipo;
  dueno: Cliente;
  created_at: string;
}

interface EquipoForm {
  marca: string;
  modelo: string;
  id_tipo_equipo: number;
  id_dueno: number;
  estado: string;
}

export default function FormularioEquipoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const accion = searchParams?.get("accion") || "nuevo";

  const [equipo, setEquipo] = useState<EquipoForm>({
    marca: "",
    modelo: "",
    id_tipo_equipo: 0,
    id_dueno: 0,
    estado: "Pendiente",
  });
  const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://172.25.2.45:8080/api/v1/equipos";
  const TIPOS_EQUIPO_URL = "http://172.25.2.45:8080/api/v1/tipos_equipo";
  const CLIENTES_URL = "http://172.25.2.45:8080/api/v1/clientes";

  // Cargar datos iniciales (tipos de equipo y clientes)
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar datos del equipo si es edición o visualización
  useEffect(() => {
    if (
      id &&
      accion !== "nuevo" &&
      tiposEquipo.length > 0 &&
      clientes.length > 0
    ) {
      cargarEquipo();
    }
  }, [id, accion, tiposEquipo, clientes]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);

      // Cargar tipos de equipo
      const [tiposResponse, clientesResponse] = await Promise.all([
        fetch(TIPOS_EQUIPO_URL),
        fetch(CLIENTES_URL),
      ]);

      if (!tiposResponse.ok || !clientesResponse.ok) {
        throw new Error("Error al cargar datos iniciales");
      }

      const tiposData = await tiposResponse.json();
      const clientesData = await clientesResponse.json();

      setTiposEquipo(tiposData.data || []);
      setClientes(clientesData.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar datos iniciales"
      );
    } finally {
      setLoadingData(false);
    }
  };

  const cargarEquipo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const equipoData = data.data;

      setEquipo({
        marca: equipoData.marca,
        modelo: equipoData.modelo,
        id_tipo_equipo: equipoData.tipo_equipo.id,
        id_dueno: equipoData.dueno.id,
        estado: equipoData.estado || "Pendiente",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar equipo");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEquipo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEquipo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (
      !equipo.marca ||
      !equipo.modelo ||
      !equipo.id_tipo_equipo ||
      !equipo.id_dueno
    ) {
      setError("Todos los campos son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let response;
      const payload = {
        marca: equipo.marca,
        modelo: equipo.modelo,
        id_tipo_equipo: equipo.id_tipo_equipo,
        id_dueno: equipo.id_dueno,
        ...(accion === "editar" && { estado: equipo.estado }),
      };

      if (accion === "nuevo") {
        // CREAR nuevo equipo
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else if (accion === "editar" && id) {
        // ACTUALIZAR equipo existente
        response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response?.ok) {
        throw new Error(`Error ${response?.status}: ${response?.statusText}`);
      }

      const result = await response.json();
      setSuccess(
        result.msg ||
          (accion === "nuevo"
            ? "Equipo creado exitosamente"
            : "Equipo actualizado exitosamente")
      );

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/equipos");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar equipo");
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = accion === "ver";
  const title =
    accion === "nuevo"
      ? "Nuevo Equipo"
      : accion === "editar"
      ? "Editar Equipo"
      : "Ver Equipo";

  if (loadingData) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/equipos")}
          sx={{ color: "#1976d2" }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#1976d2" }}>
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
            <CircularProgress sx={{ color: "#1976d2" }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marca"
                  name="marca"
                  value={equipo.marca}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Modelo"
                  name="modelo"
                  value={equipo.modelo}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isViewMode || loading}>
                  <InputLabel>Tipo de Equipo *</InputLabel>
                  <Select
                    name="id_tipo_equipo"
                    value={equipo.id_tipo_equipo}
                    onChange={handleSelectChange}
                    label="Tipo de Equipo *"
                    required
                  >
                    <MenuItem value={0}>Seleccionar tipo</MenuItem>
                    {tiposEquipo.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isViewMode || loading}>
                  <InputLabel>Dueño *</InputLabel>
                  <Select
                    name="id_dueno"
                    value={equipo.id_dueno}
                    onChange={handleSelectChange}
                    label="Dueño *"
                    required
                  >
                    <MenuItem value={0}>Seleccionar dueño</MenuItem>
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {`${cliente.nombre} ${cliente.apellido_paterno} ${cliente.apellido_materno}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {accion === "editar" && (
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      name="estado"
                      value={equipo.estado}
                      onChange={handleSelectChange}
                      label="Estado"
                    >
                      <MenuItem value="Pendiente">Pendiente</MenuItem>
                      <MenuItem value="En Reparación">En Reparación</MenuItem>
                      <MenuItem value="Reparado">Reparado</MenuItem>
                      <MenuItem value="Devuelto">Devuelto</MenuItem>
                      <MenuItem value="Entregado">Entregado</MenuItem>
                      <MenuItem value="Cancelado">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {!isViewMode && (
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.push("/equipos")}
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
                        backgroundColor: "#1976d2",
                        "&:hover": { backgroundColor: "#1565c0" },
                      }}
                    >
                      {accion === "nuevo"
                        ? "Crear Equipo"
                        : "Actualizar Equipo"}
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
