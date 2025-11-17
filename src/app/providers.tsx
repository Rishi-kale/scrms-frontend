"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { UserProvider } from "@/lib/user-context";
import { ConfigProvider } from "@/lib/config-context";

function MuiThemeWrapper({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen",
        "Ubuntu",
        "Cantarell",
        "Fira Sans",
        "Droid Sans",
        "Helvetica Neue",
        "sans-serif",
      ].join(","),
    },
  });

  // Don't render MUI theme provider until mounted to avoid Emotion CSS hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <MuiThemeWrapper>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <ConfigProvider>
              {children}
              <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
            </ConfigProvider>
          </UserProvider>
        </QueryClientProvider>
      </MuiThemeWrapper>
    </ThemeProvider>
  );
}


