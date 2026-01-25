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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";
import SmartphoneIcon from "@mui/icons-material/Smartphone";

// Interfaces
interface Tecnico {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  fecha_ingreso: string;
}

interface Cotizacion {
  id: number;
  descripcion_falla: string;
  diagnostico: string;
  precio_total: number;
  cliente: {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string;
  };
  equipo: {
    id: number;
    marca: string;
    modelo: string;
    tipo_equipo: {
      nombre: string;
    };
  };
  estado: string;
  id_trabajo: number | null;
}

interface TrabajoForm {
  descripcion: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo: number;
  id_tecnico: number;
}

export default function FormularioTrabajoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const accion = searchParams?.get("accion") || "nuevo";

  const [trabajo, setTrabajo] = useState<TrabajoForm>({
    descripcion: "",
    estado: "Pendiente",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    costo: 0,
    id_tecnico: 0,
  });

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] =
    useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalTecnicoOpen, setModalTecnicoOpen] = useState(false);
  const [asignarCotizacion, setAsignarCotizacion] = useState(
    accion === "asignar"
  );
  const [idCotizacionSeleccionada, setIdCotizacionSeleccionada] = useState<
    number | null
  >(null);

  // Nuevo técnico
  const [nuevoTecnico, setNuevoTecnico] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
  });

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/trabajos`;
  const TECNICOS_URL = `${process.env.NEXT_PUBLIC_API_URL}/tecnicos`;
  const COTIZACIONES_URL = `${process.env.NEXT_PUBLIC_API_URL}/cotizaciones`;

  // Estados válidos
  const ESTADOS_VALIDOS = [
    "Pendiente",
    "En progreso",
    "Completado",
    "Cancelado",
  ];

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar datos del trabajo si es edición o visualización
  useEffect(() => {
    if (id && accion !== "nuevo" && tecnicos.length > 0) {
      cargarTrabajo();
    }
  }, [id, accion, tecnicos]);

  // Actualizar cotización seleccionada cuando cambia el ID
  useEffect(() => {
    if (idCotizacionSeleccionada && cotizaciones.length > 0) {
      const cotizacion = cotizaciones.find(
        (c) => c.id === idCotizacionSeleccionada
      );
      setCotizacionSeleccionada(cotizacion || null);

      // Si hay una cotización seleccionada, sugerir el costo y descripción
      if (cotizacion && trabajo.costo === 0) {
        setTrabajo((prev) => ({
          ...prev,
          costo: cotizacion.precio_total,
          descripcion:
            prev.descripcion ||
            `Reparación: ${cotizacion.equipo.marca} ${cotizacion.equipo.modelo} - ${cotizacion.diagnostico}`,
        }));
      }
    } else {
      setCotizacionSeleccionada(null);
    }
  }, [idCotizacionSeleccionada, cotizaciones]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);

      const [tecnicosResponse, cotizacionesResponse] = await Promise.all([
        fetch(TECNICOS_URL),
        fetch(COTIZACIONES_URL),
      ]);

      if (!tecnicosResponse.ok) {
        throw new Error("Error al cargar datos iniciales");
      }

      const tecnicosData = await tecnicosResponse.json();
      const cotizacionesData = cotizacionesResponse.ok
        ? await cotizacionesResponse.json()
        : { data: [] };

      setTecnicos(tecnicosData.data || []);

      // Filtrar cotizaciones abiertas o que no tengan trabajo asignado
      const cotizacionesFiltradas =
        cotizacionesData.data?.filter(
          (c: Cotizacion) => c.estado === "Abierta" || c.id_trabajo === null
        ) || [];
      setCotizaciones(cotizacionesFiltradas);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar datos iniciales"
      );
    } finally {
      setLoadingData(false);
    }
  };

  const cargarTrabajo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const trabajoData = data.data;

      // Formatear fechas para inputs
      const fechaInicio = new Date(trabajoData.fecha_inicio)
        .toISOString()
        .split("T")[0];
      const fechaFin = trabajoData.fecha_fin
        ? new Date(trabajoData.fecha_fin).toISOString().split("T")[0]
        : "";

      setTrabajo({
        descripcion: trabajoData.descripcion,
        estado: trabajoData.estado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        costo: trabajoData.costo,
        id_tecnico: trabajoData.tecnico.id,
      });

      // Buscar si este trabajo ya tiene una cotización asignada
      const cotizacionesResponse = await fetch(COTIZACIONES_URL);
      if (cotizacionesResponse.ok) {
        const cotizacionesData = await cotizacionesResponse.json();
        const cotizacionAsignada = cotizacionesData.data?.find(
          (c: Cotizacion) => c.id_trabajo === trabajoData.id_tra
        );

        if (cotizacionAsignada) {
          setIdCotizacionSeleccionada(cotizacionAsignada.id);
          setAsignarCotizacion(true);
          setCotizacionSeleccionada(cotizacionAsignada);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar trabajo");
    } finally {
      setLoading(false);
    }
  };

  // Función para crear nuevo técnico
  const crearTecnico = async () => {
    try {
      const fechaIngresoISO = new Date(
        nuevoTecnico.fecha_ingreso
      ).toISOString();

      const response = await fetch(TECNICOS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevoTecnico,
          fecha_ingreso: fechaIngresoISO,
        }),
      });

      if (!response.ok) throw new Error("Error al crear técnico");

      const result = await response.json();
      await cargarDatosIniciales(); // Recargar técnicos
      setModalTecnicoOpen(false);
      setNuevoTecnico({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        telefono: "",
        fecha_ingreso: new Date().toISOString().split("T")[0],
      });

      // Seleccionar el nuevo técnico automáticamente
      if (result.data) {
        setTrabajo((prev) => ({ ...prev, id_tecnico: result.data.id }));
      }
    } catch (err) {
      setError("Error al crear técnico");
    }
  };

  // Función para actualizar estado de cotización
  const actualizarEstadoCotizacion = async (
    idCotizacion: number,
    nuevoEstado: string,
    idTrabajo: number | null = null
  ) => {
    try {
      // Primero obtenemos la cotización actual
      const response = await fetch(`${COTIZACIONES_URL}/${idCotizacion}`);
      if (!response.ok) return false;

      const cotizacionData = await response.json();
      const cotizacionActual = cotizacionData.data;

      // Actualizamos el estado y el ID del trabajo
      const updateResponse = await fetch(
        `${COTIZACIONES_URL}/${idCotizacion}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_cliente: cotizacionActual.cliente.id,
            descripcion_falla: cotizacionActual.descripcion_falla,
            diagnostico: cotizacionActual.diagnostico,
            id_equipo: cotizacionActual.equipo.id,
            fecha_expiracion: cotizacionActual.fecha_expiracion,
            id_tecnico: cotizacionActual.tecnico.id,
            estado: nuevoEstado,
            precio_total: cotizacionActual.precio_total,
            id_trabajo: idTrabajo,
          }),
        }
      );

      return updateResponse.ok;
    } catch (err) {
      console.error("Error al actualizar cotización:", err);
      return false;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "costo") {
      setTrabajo((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setTrabajo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setTrabajo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!trabajo.descripcion || !trabajo.id_tecnico) {
      setError("La descripción y el técnico son requeridos");
      return;
    }

    if (asignarCotizacion && !idCotizacionSeleccionada) {
      setError("Debes seleccionar una cotización para asignar");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let trabajoId: number;

      // Preparar payload del trabajo (SIN id_cotizacion - la API no lo acepta)
      const payload = {
        descripcion: trabajo.descripcion,
        estado: trabajo.estado,
        fecha_inicio: new Date(trabajo.fecha_inicio).toISOString(),
        fecha_fin: trabajo.fecha_fin
          ? new Date(trabajo.fecha_fin).toISOString()
          : null,
        costo: trabajo.costo,
        id_tecnico: trabajo.id_tecnico,
      };

      if (accion === "nuevo") {
        // CREAR nuevo trabajo
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData?.detail?.[0]?.msg ||
              `Error ${response.status}: ${response.statusText}`
          );
        }

        const result = await response.json();
        trabajoId = result.data.id_tra;
      } else if (accion === "editar" && id) {
        // ACTUALIZAR trabajo existente
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData?.detail?.[0]?.msg ||
              `Error ${response.status}: ${response.statusText}`
          );
        }

        const result = await response.json();
        trabajoId = result.data.id_tra || parseInt(id);
      } else if (accion === "asignar" && id) {
        // Solo actualizar el trabajo si es modo asignar
        trabajoId = parseInt(id);
      } else {
        throw new Error("Acción no válida");
      }

      // LÓGICA DE ACTUALIZACIÓN DE COTIZACIONES
      if (asignarCotizacion && idCotizacionSeleccionada) {
        // 1. Buscar todas las cotizaciones que estén aprobadas para ESTE trabajo
        const cotizacionesAprobadas = cotizaciones.filter(
          (c) => c.estado === "Aprobada" && c.id_trabajo === trabajoId
        );

        // 2. Rechazar otras cotizaciones que estén aprobadas para este trabajo
        for (const cotizacion of cotizacionesAprobadas) {
          if (cotizacion.id !== idCotizacionSeleccionada) {
            await actualizarEstadoCotizacion(cotizacion.id, "Rechazada", null);
          }
        }

        // 3. Aprobar la cotización seleccionada y asignarle el ID del trabajo
        const aprobacionExitosa = await actualizarEstadoCotizacion(
          idCotizacionSeleccionada,
          "Aprobada",
          trabajoId
        );

        if (aprobacionExitosa) {
          setSuccess(
            accion === "nuevo"
              ? "Trabajo creado y cotización asignada exitosamente"
              : "Cotización asignada al trabajo exitosamente"
          );
        } else {
          setSuccess(
            accion === "nuevo"
              ? "Trabajo creado exitosamente, pero hubo un error al asignar la cotización"
              : "Trabajo actualizado exitosamente, pero hubo un error al asignar la cotización"
          );
        }
      } else if (!asignarCotizacion && id) {
        // Si se quita la asignación de cotización, limpiar cualquier cotización asociada
        const cotizacionesAnteriores = cotizaciones.filter(
          (c) => c.id_trabajo === parseInt(id)
        );
        for (const cotizacion of cotizacionesAnteriores) {
          await actualizarEstadoCotizacion(cotizacion.id, "Abierta", null);
        }
        setSuccess("Trabajo actualizado exitosamente");
      } else if (accion === "nuevo" && !asignarCotizacion) {
        setSuccess("Trabajo creado exitosamente");
      }

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/trabajos");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar trabajo");
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = accion === "ver";
  const isAsignarMode = accion === "asignar";
  const title =
    accion === "nuevo"
      ? "Nuevo Trabajo"
      : accion === "editar"
      ? "Editar Trabajo"
      : accion === "asignar"
      ? "Asignar Cotización a Trabajo"
      : "Ver Trabajo";

  // Función para obtener nombre completo
  const getNombreCompleto = (tecnico: Tecnico) => {
    return `${tecnico.nombre} ${tecnico.apellido_paterno} ${tecnico.apellido_materno}`.trim();
  };

  const getNombreCompletoCliente = (cliente: any) => {
    return `${cliente.nombre} ${cliente.apellido_paterno} ${cliente.apellido_materno}`.trim();
  };

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
        <CircularProgress sx={{ color: "#f57c00" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/trabajos")}
          sx={{ color: "#f57c00" }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#f57c00" }}>
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
            <CircularProgress sx={{ color: "#f57c00" }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Asignación de Cotización */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={asignarCotizacion}
                      onChange={(e) => {
                        setAsignarCotizacion(e.target.checked);
                        if (!e.target.checked) {
                          setIdCotizacionSeleccionada(null);
                          setCotizacionSeleccionada(null);
                        }
                      }}
                      disabled={isViewMode || loading}
                      color="primary"
                    />
                  }
                  label="Asignar a cotización existente"
                />

                {asignarCotizacion && (
                  <>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Seleccionar Cotización *</InputLabel>
                      <Select
                        value={idCotizacionSeleccionada || ""}
                        onChange={(e) =>
                          setIdCotizacionSeleccionada(e.target.value as number)
                        }
                        label="Seleccionar Cotización *"
                        required
                      >
                        <MenuItem value="">Seleccionar cotización</MenuItem>
                        {cotizaciones
                          .filter(
                            (c) =>
                              c.estado === "Abierta" || c.id_trabajo === null
                          )
                          .map((cotizacion) => (
                            <MenuItem key={cotizacion.id} value={cotizacion.id}>
                              #{cotizacion.id} -{" "}
                              {getNombreCompletoCliente(cotizacion.cliente)} -
                              {cotizacion.equipo.marca}{" "}
                              {cotizacion.equipo.modelo}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    {/* Información de la cotización seleccionada */}
                    {cotizacionSeleccionada && (
                      <Card sx={{ mt: 2, border: "2px solid #f57c00" }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ color: "#f57c00" }}
                          >
                            Información de la Cotización Seleccionada
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <PersonIcon color="action" />
                                <Typography>
                                  <strong>Cliente:</strong>{" "}
                                  {getNombreCompletoCliente(
                                    cotizacionSeleccionada.cliente
                                  )}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Tel: {cotizacionSeleccionada.cliente.telefono}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <SmartphoneIcon color="action" />
                                <Typography>
                                  <strong>Equipo:</strong>{" "}
                                  {cotizacionSeleccionada.equipo.marca}{" "}
                                  {cotizacionSeleccionada.equipo.modelo}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Tipo:{" "}
                                {
                                  cotizacionSeleccionada.equipo.tipo_equipo
                                    .nombre
                                }
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Typography>
                                <strong>Diagnóstico:</strong>{" "}
                                {cotizacionSeleccionada.diagnostico}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Typography variant="h6" color="success.main">
                                <AttachMoneyIcon /> Precio cotizado:{" "}
                                {new Intl.NumberFormat("es-BO", {
                                  style: "currency",
                                  currency: "BOB",
                                }).format(cotizacionSeleccionada.precio_total)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </Grid>

              {/* Descripción */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descripción del Trabajo"
                  name="descripcion"
                  value={trabajo.descripcion}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  multiline
                  rows={3}
                  variant={isViewMode ? "filled" : "outlined"}
                  placeholder="Describa detalladamente el trabajo a realizar..."
                />
              </Grid>

              {/* Información del Técnico */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth disabled={isViewMode || loading}>
                  <InputLabel>Técnico *</InputLabel>
                  <Select
                    name="id_tecnico"
                    value={trabajo.id_tecnico}
                    onChange={handleSelectChange}
                    label="Técnico *"
                    required
                  >
                    <MenuItem value={0}>Seleccionar técnico</MenuItem>
                    {tecnicos.map((tecnico) => (
                      <MenuItem key={tecnico.id} value={tecnico.id}>
                        {getNombreCompleto(tecnico)} - {tecnico.telefono}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {!isViewMode && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setModalTecnicoOpen(true)}
                    sx={{ mt: 1, color: "#f57c00" }}
                    size="small"
                  >
                    Nuevo Técnico
                  </Button>
                )}
              </Grid>

              {/* Estado */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth disabled={isViewMode || loading}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={trabajo.estado}
                    onChange={handleSelectChange}
                    label="Estado"
                  >
                    {ESTADOS_VALIDOS.map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Fechas */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Fecha de Inicio"
                  name="fecha_inicio"
                  type="date"
                  value={trabajo.fecha_inicio}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Fecha de Fin (Opcional)"
                  name="fecha_fin"
                  type="date"
                  value={trabajo.fecha_fin}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  variant={isViewMode ? "filled" : "outlined"}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Costo */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Costo"
                  name="costo"
                  type="number"
                  value={trabajo.costo}
                  onChange={handleInputChange}
                  disabled={isViewMode || loading}
                  required
                  variant={isViewMode ? "filled" : "outlined"}
                  InputProps={{
                    startAdornment: (
                      <AttachMoneyIcon color="action" sx={{ mr: 1 }} />
                    ),
                    inputProps: { min: 0, step: 0.01 },
                  }}
                  helperText={
                    cotizacionSeleccionada ? "Sugerido según cotización" : ""
                  }
                />
              </Grid>

              {!isViewMode && (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.push("/trabajos")}
                      disabled={loading}
                      size="large"
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
                        backgroundColor: "#f57c00",
                        "&:hover": { backgroundColor: "#e65100" },
                        px: 4,
                        py: 1,
                      }}
                      size="large"
                    >
                      {accion === "nuevo"
                        ? "Crear Trabajo"
                        : accion === "asignar"
                        ? "Asignar Cotización"
                        : "Actualizar Trabajo"}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </Paper>

      {/* Modal para Nuevo Técnico */}
      <Dialog
        open={modalTecnicoOpen}
        onClose={() => setModalTecnicoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nuevo Técnico</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={nuevoTecnico.nombre}
                onChange={(e) =>
                  setNuevoTecnico({ ...nuevoTecnico, nombre: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                value={nuevoTecnico.apellido_paterno}
                onChange={(e) =>
                  setNuevoTecnico({
                    ...nuevoTecnico,
                    apellido_paterno: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellido Materno"
                value={nuevoTecnico.apellido_materno}
                onChange={(e) =>
                  setNuevoTecnico({
                    ...nuevoTecnico,
                    apellido_materno: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={nuevoTecnico.telefono}
                onChange={(e) =>
                  setNuevoTecnico({ ...nuevoTecnico, telefono: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Fecha de Ingreso"
                type="date"
                value={nuevoTecnico.fecha_ingreso}
                onChange={(e) =>
                  setNuevoTecnico({
                    ...nuevoTecnico,
                    fecha_ingreso: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalTecnicoOpen(false)}>Cancelar</Button>
          <Button onClick={crearTecnico} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
