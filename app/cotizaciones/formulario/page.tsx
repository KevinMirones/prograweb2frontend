"use client";

import React, { useEffect, useState, Suspense } from "react";
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
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Interfaces
interface Cliente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  created_at: string;
}

interface Tecnico {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  fecha_ingreso: string;
}

interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion: string;
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

interface CotizacionForm {
  id_cliente: number;
  descripcion_falla: string;
  diagnostico: string;
  id_equipo: number;
  fecha_expiracion: string;
  id_tecnico: number;
  precio_total: number;
  estado: string;
  id_trabajo: number | null;
}

// Estados válidos
const ESTADOS_VALIDOS = ["Abierta", "Aceptada", "Rechazada", "Expirada"];

// Componente que usa useSearchParams
function FormularioCotizacionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const accion = searchParams?.get("accion") || "nuevo";

  const [cotizacion, setCotizacion] = useState<CotizacionForm>({
    id_cliente: 0,
    descripcion_falla: "",
    diagnostico: "",
    id_equipo: 0,
    fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 7 días desde hoy
    id_tecnico: 0,
    precio_total: 0,
    estado: "Abierta",
    id_trabajo: null,
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para modales de creación rápida
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [modalEquipoOpen, setModalEquipoOpen] = useState(false);
  const [modalTecnicoOpen, setModalTecnicoOpen] = useState(false);

  // Nuevos registros
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
  });

  const [nuevoEquipo, setNuevoEquipo] = useState({
    marca: "",
    modelo: "",
    id_tipo_equipo: 0,
    id_dueno: 0,
  });

  const [nuevoTecnico, setNuevoTecnico] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
  });

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cotizaciones`;
  const CLIENTES_URL = `${process.env.NEXT_PUBLIC_API_URL}/clientes`;
  const TECNICOS_URL = `${process.env.NEXT_PUBLIC_API_URL}/tecnicos`;
  const EQUIPOS_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipos`;
  const TIPOS_EQUIPO_URL = `${process.env.NEXT_PUBLIC_API_URL}/tipos_equipo`;

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar datos de la cotización si es edición o visualización
  useEffect(() => {
    if (
      id &&
      accion !== "nuevo" &&
      clientes.length > 0 &&
      tecnicos.length > 0 &&
      equipos.length > 0
    ) {
      cargarCotizacion();
    }
  }, [id, accion, clientes, tecnicos, equipos]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);

      const [
        clientesResponse,
        tecnicosResponse,
        equiposResponse,
        tiposResponse,
      ] = await Promise.all([
        fetch(CLIENTES_URL),
        fetch(TECNICOS_URL),
        fetch(EQUIPOS_URL),
        fetch(TIPOS_EQUIPO_URL),
      ]);

      if (
        !clientesResponse.ok ||
        !tecnicosResponse.ok ||
        !equiposResponse.ok ||
        !tiposResponse.ok
      ) {
        throw new Error("Error al cargar datos iniciales");
      }

      const clientesData = await clientesResponse.json();
      const tecnicosData = await tecnicosResponse.json();
      const equiposData = await equiposResponse.json();
      const tiposData = await tiposResponse.json();

      setClientes(clientesData.data || []);
      setTecnicos(tecnicosData.data || []);
      setEquipos(equiposData.data || []);
      setTiposEquipo(tiposData.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar datos iniciales"
      );
    } finally {
      setLoadingData(false);
    }
  };

  const cargarCotizacion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const cotizacionData = data.data;

      // Formatear fecha para el input
      const fechaExpiracion = new Date(cotizacionData.fecha_expiracion)
        .toISOString()
        .split("T")[0];

      setCotizacion({
        id_cliente: cotizacionData.cliente.id,
        descripcion_falla: cotizacionData.descripcion_falla,
        diagnostico: cotizacionData.diagnostico,
        id_equipo: cotizacionData.equipo.id,
        fecha_expiracion: fechaExpiracion,
        id_tecnico: cotizacionData.tecnico.id,
        precio_total: cotizacionData.precio_total,
        estado: cotizacionData.estado,
        id_trabajo: cotizacionData.id_trabajo,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar cotización"
      );
    } finally {
      setLoading(false);
    }
  };

  // Funciones para crear nuevos registros
  const crearCliente = async () => {
    try {
      const response = await fetch(CLIENTES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoCliente),
      });

      if (!response.ok) throw new Error("Error al crear cliente");

      const result = await response.json();
      await cargarDatosIniciales(); // Recargar clientes
      setModalClienteOpen(false);
      setNuevoCliente({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        telefono: "",
      });

      // Seleccionar el nuevo cliente automáticamente
      if (result.data) {
        setCotizacion((prev) => ({ ...prev, id_cliente: result.data.id }));
      }
    } catch (err) {
      setError("Error al crear cliente");
    }
  };

  const crearEquipo = async () => {
    try {
      const response = await fetch(EQUIPOS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoEquipo),
      });

      if (!response.ok) throw new Error("Error al crear equipo");

      const result = await response.json();
      await cargarDatosIniciales(); // Recargar equipos
      setModalEquipoOpen(false);
      setNuevoEquipo({ marca: "", modelo: "", id_tipo_equipo: 0, id_dueno: 0 });

      // Seleccionar el nuevo equipo automáticamente
      if (result.data) {
        setCotizacion((prev) => ({ ...prev, id_equipo: result.data.id }));
      }
    } catch (err) {
      setError("Error al crear equipo");
    }
  };

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
        setCotizacion((prev) => ({ ...prev, id_tecnico: result.data.id }));
      }
    } catch (err) {
      setError("Error al crear técnico");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "precio_total") {
      setCotizacion((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setCotizacion((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setCotizacion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (
      !cotizacion.id_cliente ||
      !cotizacion.id_equipo ||
      !cotizacion.id_tecnico
    ) {
      setError("Cliente, equipo y técnico son requeridos");
      return;
    }

    if (!cotizacion.descripcion_falla || !cotizacion.diagnostico) {
      setError("La descripción de la falla y el diagnóstico son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let response;
      const fechaExpiracionISO = new Date(
        cotizacion.fecha_expiracion
      ).toISOString();

      const payload = {
        id_cliente: cotizacion.id_cliente,
        descripcion_falla: cotizacion.descripcion_falla,
        diagnostico: cotizacion.diagnostico,
        id_equipo: cotizacion.id_equipo,
        fecha_expiracion: fechaExpiracionISO,
        id_tecnico: cotizacion.id_tecnico,
        precio_total: cotizacion.precio_total,
        estado: cotizacion.estado,
        id_trabajo: cotizacion.id_trabajo,
      };

      if (accion === "nuevo") {
        // CREAR nueva cotización
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else if (accion === "editar" && id) {
        // ACTUALIZAR cotización existente
        response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
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
            ? "Cotización creada exitosamente"
            : "Cotización actualizada exitosamente")
      );

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/cotizaciones");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar cotización"
      );
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = accion === "ver";
  const title =
    accion === "nuevo"
      ? "Nueva Cotización"
      : accion === "editar"
      ? "Editar Cotización"
      : "Ver Cotización";

  // Función para obtener nombre completo
  const getNombreCompleto = (persona: Cliente | Tecnico) => {
    return `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`.trim();
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
        <CircularProgress sx={{ color: "#7b1fa2" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/cotizaciones")}
          sx={{ color: "#7b1fa2" }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#7b1fa2" }}>
          {title}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Formulario */}
      <Paper sx={{ p: 4, maxWidth: 1200, margin: "0 auto" }}>
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
            <CircularProgress sx={{ color: "#7b1fa2" }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Sección 1: Información del Cliente y Equipo */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2" }}>
                  Información del Cliente y Equipo
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth disabled={isViewMode || loading}>
                      <InputLabel>Cliente *</InputLabel>
                      <Select
                        name="id_cliente"
                        value={cotizacion.id_cliente}
                        onChange={handleSelectChange}
                        label="Cliente *"
                        required
                      >
                        <MenuItem value={0}>Seleccionar cliente</MenuItem>
                        {clientes.map((cliente) => (
                          <MenuItem key={cliente.id} value={cliente.id}>
                            {getNombreCompleto(cliente)} - {cliente.telefono}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {!isViewMode && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => setModalClienteOpen(true)}
                        sx={{ mt: 1, color: "#7b1fa2" }}
                        size="small"
                      >
                        Nuevo Cliente
                      </Button>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth disabled={isViewMode || loading}>
                      <InputLabel>Equipo *</InputLabel>
                      <Select
                        name="id_equipo"
                        value={cotizacion.id_equipo}
                        onChange={handleSelectChange}
                        label="Equipo *"
                        required
                      >
                        <MenuItem value={0}>Seleccionar equipo</MenuItem>
                        {equipos.map((equipo) => (
                          <MenuItem key={equipo.id} value={equipo.id}>
                            {equipo.marca} {equipo.modelo} -{" "}
                            {equipo.tipo_equipo.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {!isViewMode && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => setModalEquipoOpen(true)}
                        sx={{ mt: 1, color: "#7b1fa2" }}
                        size="small"
                      >
                        Nuevo Equipo
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Sección 2: Información Técnica */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2" }}>
                  Información Técnica
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth disabled={isViewMode || loading}>
                      <InputLabel>Técnico *</InputLabel>
                      <Select
                        name="id_tecnico"
                        value={cotizacion.id_tecnico}
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
                        sx={{ mt: 1, color: "#7b1fa2" }}
                        size="small"
                      >
                        Nuevo Técnico
                      </Button>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Fecha de Expiración"
                      name="fecha_expiracion"
                      type="date"
                      value={cotizacion.fecha_expiracion}
                      onChange={handleInputChange}
                      disabled={isViewMode || loading}
                      required
                      variant={isViewMode ? "filled" : "outlined"}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Sección 3: Descripción de la Falla y Diagnóstico */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2" }}>
                  Descripción del Servicio
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Descripción de la Falla"
                      name="descripcion_falla"
                      value={cotizacion.descripcion_falla}
                      onChange={handleInputChange}
                      disabled={isViewMode || loading}
                      required
                      multiline
                      rows={3}
                      variant={isViewMode ? "filled" : "outlined"}
                      placeholder="Describa detalladamente la falla o problema reportado por el cliente..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Diagnóstico Técnico"
                      name="diagnostico"
                      value={cotizacion.diagnostico}
                      onChange={handleInputChange}
                      disabled={isViewMode || loading}
                      required
                      multiline
                      rows={3}
                      variant={isViewMode ? "filled" : "outlined"}
                      placeholder="Describa el diagnóstico técnico y la solución propuesta..."
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Sección 4: Información de Precio y Estado */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2" }}>
                  Información de Costo
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Precio Total"
                      name="precio_total"
                      type="number"
                      value={cotizacion.precio_total}
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
                        inputProps: { min: 0, step: 0.01 },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth disabled={isViewMode || loading}>
                      <InputLabel>Estado</InputLabel>
                      <Select
                        name="estado"
                        value={cotizacion.estado}
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
                </Grid>
              </Grid>

              {/* Resumen del Precio */}
              {cotizacion.precio_total > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Card
                    sx={{ bgcolor: "#f3e5f5", border: "2px solid #7b1fa2" }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumen de la Cotización
                      </Typography>
                      <Typography
                        variant="h4"
                        color="#7b1fa2"
                        fontWeight="bold"
                      >
                        {new Intl.NumberFormat("es-BO", {
                          style: "currency",
                          currency: "BOB",
                        }).format(cotizacion.precio_total)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Precio total del servicio
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Botones de acción */}
              {!isViewMode && (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.push("/cotizaciones")}
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
                        backgroundColor: "#7b1fa2",
                        "&:hover": { backgroundColor: "#6a1b9a" },
                        px: 4,
                        py: 1,
                      }}
                      size="large"
                    >
                      {accion === "nuevo"
                        ? "Crear Cotización"
                        : "Actualizar Cotización"}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </Paper>

      {/* Modal para Nuevo Cliente */}
      <Dialog
        open={modalClienteOpen}
        onClose={() => setModalClienteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nuevo Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={nuevoCliente.nombre}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                value={nuevoCliente.apellido_paterno}
                onChange={(e) =>
                  setNuevoCliente({
                    ...nuevoCliente,
                    apellido_paterno: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellido Materno"
                value={nuevoCliente.apellido_materno}
                onChange={(e) =>
                  setNuevoCliente({
                    ...nuevoCliente,
                    apellido_materno: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={nuevoCliente.telefono}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalClienteOpen(false)}>Cancelar</Button>
          <Button onClick={crearCliente} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Nuevo Equipo */}
      <Dialog
        open={modalEquipoOpen}
        onClose={() => setModalEquipoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nuevo Equipo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Marca"
                value={nuevoEquipo.marca}
                onChange={(e) =>
                  setNuevoEquipo({ ...nuevoEquipo, marca: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Modelo"
                value={nuevoEquipo.modelo}
                onChange={(e) =>
                  setNuevoEquipo({ ...nuevoEquipo, modelo: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Equipo</InputLabel>
                <Select
                  value={nuevoEquipo.id_tipo_equipo}
                  onChange={(e) =>
                    setNuevoEquipo({
                      ...nuevoEquipo,
                      id_tipo_equipo: e.target.value as number,
                    })
                  }
                  label="Tipo de Equipo"
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
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Dueño</InputLabel>
                <Select
                  value={nuevoEquipo.id_dueno}
                  onChange={(e) =>
                    setNuevoEquipo({
                      ...nuevoEquipo,
                      id_dueno: e.target.value as number,
                    })
                  }
                  label="Dueño"
                >
                  <MenuItem value={0}>Seleccionar dueño</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {getNombreCompleto(cliente)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEquipoOpen(false)}>Cancelar</Button>
          <Button onClick={crearEquipo} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

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

// Componente principal con Suspense
export default function FormularioCotizacionPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#7b1fa2" }} />
      </Box>
    }>
      <FormularioCotizacionContent />
    </Suspense>
  );
}