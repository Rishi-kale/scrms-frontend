"use client";
import { Suspense, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boolean, z } from "zod";
import { apiFetchRaw, setAccessToken } from "@/lib/api";
import {
  Button,
  TextField,
  Typography,
  Stack,
  Box,
  Alert,
  Paper,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotify } from "@/components/ui/NotificationProvider";
import { ALLOWED_ROLES } from "@/app/(app)/constant";

// --- Zod validation schema with better messages ---
const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});
type LoginValues = z.infer<typeof LoginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const redirectUrl = useMemo(() => {
    const url = searchParams?.get("redirectUrl");
    return url && url.startsWith("/") ? url : "/leads";
  }, [searchParams]);

  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotify();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit", // validate only when submitting
  });

  // --- handle token from redirect hash ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const token = new URLSearchParams(hash.replace("#", "?")).get("token");
        if (token) {
          setAccessToken(token);
          window.history.replaceState({}, document.title, window.location.pathname);
          router.replace("/leads");
        }
      }
    }
  }, [router]);

  // --- Submit handler ---
  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      const response = await apiFetchRaw("/api/auth/login", {
        method: "POST",
        body: values,
        withCredentials: true,
      });
      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const json = isJson ? await response.json().catch(() => undefined) : undefined;
      const token = json?.token || json?.accessToken || json?.data?.token || null;
      const roles = json?.user?.roles || json?.data?.user?.roles || [];
      var hasPermission = roles.some(
        (role: { key: string }) => ALLOWED_ROLES.includes(role.key)
      );

      if (!hasPermission) {
        notify("Your account does not have the required permissions.pl Contact admin", "error");
        return;
      }
      if (token) {
        setAccessToken(token);
        // Optionally mirror token in non-HTTPOnly cookie
        document.cookie = `Company_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        // notify user context about token change
        window.dispatchEvent(new CustomEvent("tokenChanged", { detail: { token } }));
        notify(json?.message || "Login successful", "success");
        router.replace(redirectUrl);
      } else if (!response.ok) {
        const msg = json?.message || "Invalid login credentials";
        notify(json?.message || "Login failed", "error");
        setError(msg);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
    }
  };

  // Responsive styles
  const getPaperStyles = () => {
    if (isSmallScreen) {
      return {
        p: 3,
        width: "100%",
        maxWidth: "100%",
        borderRadius: 0,
        minHeight: "100vh",
      };
    }
    if (isMediumScreen) {
      return {
        p: 3.5,
        width: "100%",
        maxWidth: 450,
      };
    }
    return {
      p: 4,
      width: "100%",
      maxWidth: 420,
    };
  };

  const getTypographyStyles = (variant: 'h5' | 'h6' | 'body2') => {
    const baseStyles = {
      h5: { fontSize: isSmallScreen ? '1.5rem' : '1.75rem' },
      h6: { fontSize: isSmallScreen ? '1.1rem' : '1.25rem' },
      body2: { fontSize: isSmallScreen ? '0.875rem' : '1rem' },
    };
    return baseStyles[variant];
  };

  const getSpacing = () => {
    return {
      stack: isSmallScreen ? 1.5 : 2,
      form: isSmallScreen ? 2 : 2.5,
      button: isSmallScreen ? 1.5 : 2,
    };
  };

  const spacing = getSpacing();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: isSmallScreen ? 1 : 2,
        bgcolor: "background.default",
        backgroundImage: isSmallScreen ? 'none' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Paper elevation={isSmallScreen ? 0 : 4} sx={getPaperStyles()}>
        <Stack spacing={spacing.stack} alignItems="center" mb={spacing.stack}>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={getTypographyStyles('h5')}
          >
            Company Client Partner
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={getTypographyStyles('body2')}
          >
            AI-Powered sales Platform
          </Typography>
        </Stack>

        <Typography
          variant="h6"
          fontWeight={600}
          gutterBottom
          sx={getTypographyStyles('h6')}
        >
          Welcome back
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: spacing.form,
            ...getTypographyStyles('body2')
          }}
        >
          Sign in to your account to continue
        </Typography>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={spacing.form}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            size={isSmallScreen ? "small" : "medium"}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            size={isSmallScreen ? "small" : "medium"}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
            size={isSmallScreen ? "medium" : "large"}
            sx={{
              py: isSmallScreen ? 1 : 1.5,
              fontSize: isSmallScreen ? '0.9rem' : '1rem'
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <Box textAlign="right">
            <MuiLink
              component={Link}
              href="/forgot-password"
              underline="hover"
              sx={{
                fontSize: isSmallScreen ? '0.8rem' : '0.875rem',
                display: 'block',
                mt: 1
              }}
            >
              Forgot your password?
            </MuiLink>
          </Box>
        </Stack>

        <Button
          sx={{
            mt: spacing.button,
            py: isSmallScreen ? 1 : 1.2,
            fontSize: isSmallScreen ? '0.9rem' : '1rem'
          }}
          variant="outlined"
          fullWidth
          size={isSmallScreen ? "medium" : "large"}
          onClick={() => {
            const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            window.location.href = `${base}/api/auth/azure/login?redirectUrl=${window.location.origin}/jobs`;
          }}
        >
          Sign in with Microsoft
        </Button>
      </Paper>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}