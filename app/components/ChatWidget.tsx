"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Fab,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

interface Message {
  id: number;
  text: str;
  sender: "user" | "bot";
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const token = localStorage.getItem("token");
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/chat`;
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {isOpen && (
        <Paper
          elevation={3}
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 350,
            height: 500,
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">AI Assistant</Typography>
            <IconButton size="small" onClick={toggleChat} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <List>
              {messages.map((msg) => (
                <ListItem
                  key={msg.id}
                  sx={{
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: "80%",
                      backgroundColor: msg.sender === "user" ? "#e3f2fd" : "#f5f5f5",
                      borderRadius: 2,
                    }}
                  >
                    <ListItemText primary={msg.text} />
                  </Paper>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ justifyContent: "flex-start" }}>
                   <CircularProgress size={20} />
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={isLoading}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
