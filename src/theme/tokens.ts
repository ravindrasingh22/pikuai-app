import { Platform } from "react-native";

export const colors = {
  brandBlue: "#4d7df3",
  brandPurple: "#7858f6",
  brandPurpleDark: "#3a208e",
  brandLilac: "#eee8ff",
  brandLilacDeep: "#d9ccff",
  shell: "#f8f7ff",
  screen: "#fbfbff",
  surface: "#ffffff",
  surfaceSoft: "#f5f6ff",
  text: "#20213f",
  textSoft: "#5f6078",
  textMuted: "#8a8ca3",
  line: "#ececf6",
  green: "#27b760",
  greenSoft: "#e9f8ee",
  blueSoft: "#eaf1ff",
  purpleSoft: "#f1e9ff",
  yellow: "#ffbf32",
  yellowSoft: "#fff4d6",
  pinkSoft: "#ffe7f3",
  danger: "#d84a38",
  dangerSoft: "#fff0ee",
  overlay: "rgba(32,33,63,0.22)"
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999
} as const;

export const typography = {
  hero: { fontSize: 30, lineHeight: 37, fontWeight: "800" as const },
  title: { fontSize: 24, lineHeight: 31, fontWeight: "800" as const },
  section: { fontSize: 18, lineHeight: 24, fontWeight: "800" as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const },
  tiny: { fontSize: 10, lineHeight: 13, fontWeight: "700" as const }
} as const;

export const shadows = {
  card: {
    shadowColor: "#32345f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.12,
    shadowRadius: 18,
    elevation: 3
  },
  lift: {
    shadowColor: "#2b2367",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === "ios" ? 0.16 : 0.2,
    shadowRadius: 28,
    elevation: 8
  }
} as const;

export const layout = {
  maxPhoneContent: 520,
  tabletBreakpoint: 760,
  sidebarWidth: 248,
  collapsedSidebarWidth: 82
} as const;
