import AppShellWrapper from "@/components/AppShellWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShellWrapper>{children}</AppShellWrapper>;
}


