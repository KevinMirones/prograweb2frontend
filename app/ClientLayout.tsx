"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/sidebar/sidebar";
import ChatWidget from "./components/ChatWidget";
import { useEffect, useState, ReactNode } from "react";
import { Box, CircularProgress, AppBar, Toolbar, IconButton, Typography, CssBaseline } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Check for token on client side
    const token = localStorage.getItem("token");
    
    if (!token && !isAuthPage) {
      router.push("/login");
    } else {
      setIsAuthenticated(!!token);
    }
    setLoading(false);
  }, [pathname, router, isAuthPage]);

  if (loading) {
     return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
     );
  }

  // If showing auth page, just render children without Sidebar/Chat
  if (isAuthPage) {
      return <>{children}</>;
  }

  // Otherwise show full layout
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      
      {/* AppBar for Mobile */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: "none" },
          backgroundColor: "#1e293b", 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Service Center
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      
      <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5", p: 3, pt: { xs: 8, sm: 3 } }}>
        {children}
        <ChatWidget />
      </Box>
    </Box>
  );
}
