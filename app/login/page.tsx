"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload: any = {
        email,
        password,
      };

      if (isMfaRequired) {
        payload.mfa_code = mfaCode;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (data.mfa_required) {
        setIsMfaRequired(true);
      } else {
        localStorage.setItem("token", data.access_token);
        router.push("/"); // Redirect to dashboard/home
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5">
            {isMfaRequired ? "MFA Verification" : "Sign in"}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: "100%" }}>
            {!isMfaRequired ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                  A verification code has been sent to your email.
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="mfaCode"
                  label="Verification Code"
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {isMfaRequired ? "Verify" : "Sign In"}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
