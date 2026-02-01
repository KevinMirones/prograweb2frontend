"use client";

import React from "react";
import { Box, Tabs, Tab, Drawer, useTheme, useMediaQuery } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import ComputerIcon from "@mui/icons-material/Computer";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HandymanIcon from "@mui/icons-material/Handyman";
import LogoutIcon from "@mui/icons-material/Logout";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

const drawerWidth = 120; // Reduced width for icon-focused sidebar

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const [value, setValue] = React.useState(0);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (isMobile && onClose) onClose();

    switch (newValue) {
      case 0:
        router.push("/cotizaciones");
        break;
      case 1:
        router.push("/trabajos");
        break;
      case 2:
        router.push("/clientes");
        break;
      case 3:
        router.push("/equipos");
        break;
      case 4:
        router.push("/tecnicos");
        break;
      case 5:
        router.push("/servicios");
        break;
    }
  };

  const drawerContent = (
    <Box
      className="no-print"
      sx={{
        height: "100%",
        width: drawerWidth,
        backgroundColor: "#1e293b",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        py: 2,
        background: "linear-gradient(180deg, #0a2145ff 0%, #334155 100%)",
      }}
    >
      <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        sx={{
          "& .MuiTab-root": {
            color: "#e2e8f0",
            minWidth: "100%",
            borderRadius: "8px",
            mb: 2,
            fontSize: "0.75rem",
            fontWeight: 500,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.28)",
              transform: "translateY(-1px)",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "#385686ff",
            color: "#ffffff",
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab icon={<ListAltIcon />} label="Cotización" />
        <Tab icon={<BuildIcon />} label="Trabajos" />
        <Tab icon={<PeopleIcon />} label="Clientes" />
        <Tab icon={<ComputerIcon />} label="Equipos" />
        <Tab icon={<EngineeringIcon />} label="Técnicos" />
        <Tab icon={<HandymanIcon />} label="Servicios" />
      </Tabs>
      
      <Box sx={{ mt: "auto", mb: 2, width: "100%", px: 1 }}>
        <Button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          startIcon={<LogoutIcon />}
          sx={{
            color: "#e2e8f0",
            width: "100%",
            fontSize: "0.75rem",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "rgba(255, 99, 71, 0.2)",
              color: "#ff6347",
            },
          }}
        >
          Salir
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
