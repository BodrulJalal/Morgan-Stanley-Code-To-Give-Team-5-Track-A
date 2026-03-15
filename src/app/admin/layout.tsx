"use client";

import { AppShell, MantineProvider, createTheme } from "@mantine/core";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const adminTheme = createTheme({
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), monospace",
  headings: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    fontWeight: "700",
  },
  primaryColor: "orange",
  colors: {
    orange: [
      "#fff4e7",
      "#ffe7cc",
      "#ffd3a3",
      "#ffbe78",
      "#ffab52",
      "#ff9f3d",
      "#ff972f",
      "#e38220",
      "#ca7317",
      "#b0610b",
    ],
    violet: [
      "#f4e9ff",
      "#e6d0ff",
      "#cda0ff",
      "#b36dff",
      "#9d42ff",
      "#9027ff",
      "#8918ff",
      "#7610e3",
      "#680bc9",
      "#5705af",
    ],
  },
  defaultGradient: {
    from: "orange.5",
    to: "violet.5",
    deg: 115,
  },
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={adminTheme}>
      <AppShell
        navbar={{ width: 260, breakpoint: "sm" }}
        padding="md"
        styles={{
          root: {
            fontFamily: "var(--font-geist-sans), sans-serif",
          },
          navbar: {
            fontFamily: "var(--font-geist-sans), sans-serif",
          },
          main: {
            background: "var(--mantine-color-gray-0)",
            height: "100vh",
            overflowY: "auto",
            fontFamily: "var(--font-geist-sans), sans-serif",
          },
        }}
      >
        <AppShell.Navbar p={0}>
          <AdminSidebar />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
