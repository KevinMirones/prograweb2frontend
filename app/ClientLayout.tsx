"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/sidebar/sidebar";
import ChatWidget from "./components/ChatWidget";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAuthPage = pathname === "/login" || pathname === "/register";

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
      <Sidebar />
      <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5", p: 3 }}>
        {children}
        <ChatWidget />
      </Box>
    </Box>
  );
}
