// src/theme.ts
export const THEME = {
  colors: {
    bg: "#0b0b0f",
    card: "#111318",
    text: "#ffffff",
    textMuted: "#9aa0a6",
    primary: "#22c55e",       // vert
    primaryDark: "#16a34a",
    danger: "#ef4444",
    info: "#3b82f6",
    border: "#23252d",
    input: "#0f1116",
  },
  radii: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
  },
  spacing: (n: number) => n * 8,
  shadow: {
    // ombre douce pour iOS/Android
    style: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    } as const,
  },
  font: {
    h1: { fontSize: 28, fontWeight: "800" } as const,
    h2: { fontSize: 20, fontWeight: "700" } as const,
    body: { fontSize: 16 } as const,
    small: { fontSize: 13, color: "#9aa0a6" } as const,
  },
};
export type Theme = typeof THEME;
