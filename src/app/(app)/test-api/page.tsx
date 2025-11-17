"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Button, Card, CardContent, Stack } from "@mui/material";


export default function TestApiPage() {
  const [apiUrl, setApiUrl] = useState<string>("");

  useEffect(() => {
    // Get the API URL from environment
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
  }, []);


  const testLogin = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'superadmin@Company.com',
          password: 'Company@1234'
        }),
        credentials: 'include'
      });
      const data = await response.json();


      if (data.token) {
        localStorage.setItem('Company_token', data.token);
        alert('Login successful! Token saved.');
      } else {
        alert(`Login failed: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error('Login Test Error:', err);
      alert(`Login Test Error: ${err}`);
    }
  };

  const testApiConnection = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('Company_token');


      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/jobs/meta/countries`, {
        headers,
        credentials: 'include'
      });
      const data = await response.json();

      alert(`API Test: ${response.status} - ${JSON.stringify(data).slice(0, 100)}...`);
    } catch (err) {
      console.error('API Test Error:', err);
      alert(`API Test Error: ${err}`);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        API Test Page
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Base URL: {apiUrl}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={testLogin}
            >
              Test Login
            </Button>
            <Button
              variant="outlined"
              onClick={testApiConnection}
            >
              Test API Connection
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Check browser console for detailed logs
        </Typography>
      </Box>
    </Box>
  );
}
