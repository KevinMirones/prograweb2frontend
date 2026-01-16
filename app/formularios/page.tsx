"use client";

import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface Servicio {
  servicio: string;
  cantidad: number;
  precio: number;
}

interface Cotizacion {
  id: string;
  ci: string;
  cliente: string;
  detalle: string;
  estado: string;
  telefono: string;
  equipo: string;
  marca: string;
  modelo: string;
  servicios: Servicio[];
  total: number;
  validoHasta: string;
  garantia: string;
  firma: string;
  tipo: string;
}

export default function FormularioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");
  const accion = searchParams.get("accion");

  const [servicios, setServicios] = React.useState<Servicio[]>([]);
  const [equipo, setEquipo] = React.useState("");
  const [cliente, setCliente] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [marca, setMarca] = React.useState("");
  const [modelo, setModelo] = React.useState("");
  const [problema, setProblema] = React.useState("");
  const [validoHasta, setValidoHasta] = React.useState("");
  const [garantia, setGarantia] = React.useState("");
  const [firma, setFirma] = React.useState("");
  const [estado, setEstado] = React.useState("Pendiente");
  const [numeroCarnet, setNumeroCarnet] = React.useState("");

  const [openModal, setOpenModal] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [servicioForm, setServicioForm] = React.useState<Servicio>({
    servicio: "",
    cantidad: 1,
    precio: 0,
  });

  const readOnly = accion === "ver";

  React.useEffect(() => {
    if (id) {
      const data = localStorage.getItem("registros");
      if (data) {
        const registros: Cotizacion[] = JSON.parse(data);
        const registro = registros.find((r) => r.id === id);
        if (registro) {
          setCliente(registro.cliente);
          setTelefono(registro.telefono);
          setNumeroCarnet(registro.ci);
          setEquipo(registro.equipo);
          setMarca(registro.marca);
          setModelo(registro.modelo);
          setProblema(registro.detalle);
          setServicios(registro.servicios);
          setValidoHasta(registro.validoHasta);
          setGarantia(registro.garantia);
          setFirma(registro.firma);
          setEstado(registro.estado);
        } else {
          alert("Registro no encontrado");
          router.push("/cotizacion");
        }
      }
    }
  }, [id, router]);

  const total = servicios.reduce((acc, s) => acc + s.cantidad * s.precio, 0);

  const handleOpenModal = (index: number | null = null) => {
    if (readOnly) return;
    if (index !== null) {
      setEditIndex(index);
      setServicioForm(servicios[index]);
    } else {
      setEditIndex(null);
      setServicioForm({ servicio: "", cantidad: 1, precio: 0 });
    }
    setOpenModal(true);
  };

  const handleSaveServicio = () => {
    if (!servicioForm.servicio.trim()) {
      alert("Debe ingresar un servicio");
      return;
    }
    if (editIndex !== null) {
      setServicios((prev) =>
        prev.map((item, i) => (i === editIndex ? servicioForm : item))
      );
    } else {
      setServicios([...servicios, servicioForm]);
    }
    setServicioForm({ servicio: "", cantidad: 1, precio: 0 });
    setEditIndex(null);
    setOpenModal(false);
  };

  const eliminarServicio = (index: number) => {
    if (readOnly) return;
    setServicios(servicios.filter((_, i) => i !== index));
  };
// Solo cambia la función handleGuardar para sincronizar `tipo` con el `estado`

const handleGuardar = () => {
  if (!cliente || !telefono || !equipo || !numeroCarnet) {
    alert("Por favor completa todos los campos obligatorios");
    return;
  }

  // Determinar el tipo según el estado
  let tipoRegistro = "Reparacion";
  if (estado === "Terminado") tipoRegistro = "Terminado";
  else if (estado === "Entregado") tipoRegistro = "Entregado";
  // Puedes agregar más reglas si hay otros estados que cambien el tipo

  const nuevaCotizacion: Cotizacion = {
    id: id || Date.now().toString(),
    ci: numeroCarnet,
    cliente,
    detalle: problema || "(sin detalle)",
    estado,
    telefono,
    equipo,
    marca,
    modelo,
    servicios,
    total,
    validoHasta,
    garantia,
    firma,
    tipo: tipoRegistro, // <-- aquí se sincroniza con el estado
  };

  try {
    const data = localStorage.getItem("registros");
    let registros: Cotizacion[] = data ? JSON.parse(data) : [];

    registros = registros.filter((r) => r.id !== nuevaCotizacion.id);
    registros.push(nuevaCotizacion);

    localStorage.setItem("registros", JSON.stringify(registros));

    alert("✅ Registro guardado correctamente");

    limpiarFormulario();
    router.push("/cotizacion");
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("❌ Error al guardar el registro. Revisa la consola.");
  }
};
  const handleCancelar = () => {
    if (readOnly) return;
    if (confirm("¿Deseas cancelar y borrar los datos ingresados?")) {
      limpiarFormulario();
    }
  };

  const limpiarFormulario = () => {
    setCliente("");
    setTelefono("");
    setEquipo("");
    setMarca("");
    setModelo("");
    setProblema("");
    setServicios([]);
    setValidoHasta("");
    setGarantia("");
    setFirma("");
    setEstado("Pendiente");
    setNumeroCarnet("");
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 900, margin: "auto" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Image src="/logo-tiluchi.png" alt="Tiluchi Logo" width={60} height={60} />
            <Typography variant="h5" fontWeight="bold" color="#1565c0">
              COTIZACIÓN DE SERVICIO TÉCNICO
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            label="Fecha de Emisión"
            type="date"
            InputLabelProps={{ shrink: true }}
            disabled={readOnly}
          />
          <TextField
            fullWidth
            label="Válido Hasta"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={validoHasta}
            onChange={(e) => setValidoHasta(e.target.value)}
            disabled={readOnly}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Datos del Cliente
        </Typography>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            label="Nombre del Cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            disabled={readOnly}
          />
          <TextField
            fullWidth
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            disabled={readOnly}
          />
          <TextField
            fullWidth
            label="Carnet de Identidad"
            value={numeroCarnet}
            onChange={(e) => setNumeroCarnet(e.target.value)}
            disabled={readOnly}
          />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Detalle del Equipo
        </Typography>
        <Box display="flex" gap={2} mb={3}>
          <FormControl fullWidth disabled={readOnly}>
            <InputLabel>Equipo</InputLabel>
            <Select value={equipo} label="Equipo" onChange={(e) => setEquipo(e.target.value)}>
              <MenuItem value="Desktop / Escritorio">Desktop / Escritorio</MenuItem>
              <MenuItem value="Laptop">Laptop</MenuItem>
              <MenuItem value="Celular">Celular</MenuItem>
              <MenuItem value="Tablet">Tablet</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} disabled={readOnly} />
          <TextField fullWidth label="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} disabled={readOnly} />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Definición del Problema
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={problema}
          onChange={(e) => setProblema(e.target.value)}
          placeholder="Describa el problema o solicitud del cliente..."
          sx={{ mb: 3 }}
          disabled={readOnly}
        />

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Servicios
        </Typography>
        {!readOnly && (
          <Button variant="contained" color="success" startIcon={<AddBoxIcon />} onClick={() => handleOpenModal()} className="no-print">
            Agregar Servicio
          </Button>
        )}

        <Table size="small" sx={{ my: 3 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1565c0" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Servicio</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Cantidad</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Precio Unitario (Bs)</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total (Bs)</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicios.map((s, index) => (
              <TableRow key={index}>
                <TableCell>{s.servicio}</TableCell>
                <TableCell>{s.cantidad}</TableCell>
                <TableCell>{s.precio.toFixed(2)}</TableCell>
                <TableCell>{(s.cantidad * s.precio).toFixed(2)}</TableCell>
                <TableCell>
                  {!readOnly && (
                    <>
                      <Button color="primary" onClick={() => handleOpenModal(index)} startIcon={<EditIcon />}>
                        Editar
                      </Button>
                      <Button color="error" onClick={() => eliminarServicio(index)} startIcon={<DeleteIcon />}>
                        Eliminar
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Typography variant="h6">
            <strong>Total Bs:</strong> {total.toFixed(2)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <FormControl fullWidth disabled={readOnly}>
            <InputLabel>Estado</InputLabel>
            <Select value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Aceptado">Aceptado</MenuItem>
              <MenuItem value="Expirado">Expirado</MenuItem>
              <MenuItem value="Rechazado">Rechazado</MenuItem>
              <MenuItem value="Terminado">Terminado</MenuItem>   
              <MenuItem value="Entregado">Entregado</MenuItem>    
            </Select>
          </FormControl>
          <TextField fullWidth label="Firma del Cliente" value={firma} onChange={(e) => setFirma(e.target.value)} disabled={readOnly} />
        </Box>

        {!readOnly && (
          <Box display="flex" justifyContent="center" gap={2} mt={3} className="no-print">
            <Button variant="contained" color="success" sx={{ px: 4 }} onClick={handleGuardar}>
              GUARDAR
            </Button>
            <Button variant="contained" color="error" sx={{ px: 4 }} onClick={handleCancelar}>
              CANCELAR
            </Button>
          </Box>
        )}

        <Box display="flex" justifyContent="center" mt={3} className="no-print">
          <Button variant="contained" color="primary" sx={{ px: 4 }} onClick={() => window.print()}>
            IMPRIMIR
          </Button>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          color="primary"
          onClick={() => router.back()}
          sx={{ mt: 2 }}
          className="no-print"
        >
          Volver atrás
        </Button>
      </Paper>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>{editIndex !== null ? "Editar Servicio" : "Agregar Servicio"}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            margin="dense"
            label="Servicio"
            fullWidth
            value={servicioForm.servicio}
            onChange={(e) => setServicioForm({ ...servicioForm, servicio: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Cantidad"
            type="number"
            fullWidth
            value={servicioForm.cantidad}
            onChange={(e) => setServicioForm({ ...servicioForm, cantidad: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Precio Unitario"
            type="number"
            fullWidth
            value={servicioForm.precio}
            onChange={(e) => setServicioForm({ ...servicioForm, precio: parseFloat(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={handleSaveServicio} variant="contained" color="success">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
