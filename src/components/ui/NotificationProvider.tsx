"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Slide, SlideProps, Snackbar, useTheme, useMediaQuery, Box } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

type NotifyContextType = {
  notify: (
    message: string,
    severity?: 'success' | 'error' | 'warning' | 'info',
    onClose?: () => void
  ) => void;
};

const NotifyContext = createContext<NotifyContextType | undefined>(undefined);

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>("success");
  const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | undefined>();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const notify = (
    msg: string,
    type: 'success' | 'error' | 'warning' | 'info' = "success",
    onClose?: () => void
  ) => {
    setMessage(msg);
    setSeverity(type);
    setOnCloseCallback(() => onClose); // save callback
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    setOpen(false);
    if (onCloseCallback) {
      onCloseCallback();
      setOnCloseCallback(undefined); // reset after firing
    }
  };

  const getIcon = () => {
    switch (severity) {
      case 'success': return <CheckCircleIcon sx={{ color: '#ffffff', fontSize: 20 }} />;
      case 'error': return <ErrorIcon sx={{ color: '#ffffff', fontSize: 20 }} />;
      case 'warning': return <WarningIcon sx={{ color: '#ffffff', fontSize: 20 }} />;
      case 'info': return <InfoIcon sx={{ color: '#ffffff', fontSize: 20 }} />;
      default: return <CheckCircleIcon sx={{ color: '#ffffff', fontSize: 20 }} />;
    }
  };

  const getBackgroundGradient = () => {
    switch (severity) {
      case 'success': return 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
      case 'error': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'info': return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
      default: return 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
    }
  };

  const getToastStyles = () => ({
    background: getBackgroundGradient(),
    borderRadius: 0,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), 0 2px 12px rgba(0, 0, 0, 0.1)',
    padding: isSmallScreen ? '14px 16px' : '18px 24px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'fixed',
    overflow: 'hidden',
    margin: 0,
    left: 0,
    right: 0,
    top: isSmallScreen ? 'calc(env(safe-area-inset-top, 0px))' : 0,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.1)',
      pointerEvents: 'none',
    }
  });

  return (
    <NotifyContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideDownTransition}
        sx={{
          position: 'fixed',
          top: isSmallScreen ? 'calc(env(safe-area-inset-top, 0px))' : 0,
          left: 0,
          right: 0,
          width: '100%',
          transform: 'none',
          margin: 0,
          padding: 0,
          zIndex: theme.zIndex.snackbar,
          '&.MuiSnackbar-root': {
            top: isSmallScreen ? 'calc(env(safe-area-inset-top, 0px))' : 0,
            margin: 0,
            padding: 0,
          },
          '& .MuiSnackbar-anchorOriginTopCenter': {
            top: isSmallScreen ? 'calc(env(safe-area-inset-top, 0px))' : 0,
            margin: 0,
            padding: 0,
          },
          '& .MuiSnackbarContent-root': {
            padding: 0,
            margin: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
          '& .MuiSnackbar-root': {
            position: 'fixed',
            top: isSmallScreen ? 'calc(env(safe-area-inset-top, 0px))' : 0,
            margin: 0,
            padding: 0,
          }
        }}
      >
        <Box sx={getToastStyles()} onClick={(e) => e.stopPropagation()}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 1,
              width: '100%',
            }}
          >
            <Box
              sx={{
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.3,
                wordBreak: 'break-word',
                textAlign: 'center',
              }}
            >
              {message}
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              animation: 'shine 3s infinite',
              pointerEvents: 'none',
              '@keyframes shine': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' },
              },
            }}
          />
        </Box>
      </Snackbar>
    </NotifyContext.Provider>
  );
};

export const useNotify = (): NotifyContextType => {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error("useNotify must be used within a NotificationProvider");
  }
  return context;
};
