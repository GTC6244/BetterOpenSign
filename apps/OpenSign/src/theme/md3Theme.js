import { createTheme } from "@mui/material/styles";

/**
 * OpenSign Material Design 3 (Material You) theme.
 *
 * Brand source colors (from the legacy DaisyUI themes):
 *   - Light primary : #002864 (deep navy)
 *   - Accent/CTA    : #E10032 (red)
 *   - Dark primary  : #007ACC / #4A9EFF (VS Code blue)
 *
 * These are mapped onto the MD3 color-role system (primary / secondary /
 * tertiary + their container + on- roles, plus surface tones). MUI v7 consumes
 * the standard palette keys; the extra MD3 roles (container tones, surface
 * variants, outline) are attached under each color so components and `sx`
 * styles can reference the full Material You system.
 */

// ---------------------------------------------------------------------------
// MD3 color schemes
// ---------------------------------------------------------------------------
const lightColors = {
  primary: {
    main: "#002864",
    light: "#2a4d8a",
    dark: "#001a41",
    contrastText: "#ffffff",
    container: "#d8e2ff",
    onContainer: "#001a41"
  },
  secondary: {
    // Brand accent (red) — used for CTAs/highlights in the legacy theme.
    main: "#c00028",
    light: "#e10032",
    dark: "#93000f",
    contrastText: "#ffffff",
    container: "#ffdad9",
    onContainer: "#410007"
  },
  tertiary: {
    main: "#006874",
    contrastText: "#ffffff",
    container: "#97f0ff",
    onContainer: "#001f24"
  },
  error: {
    main: "#ba1a1a",
    contrastText: "#ffffff",
    container: "#ffdad6",
    onContainer: "#410002"
  },
  warning: {
    main: "#9c6f00",
    contrastText: "#ffffff",
    container: "#ffdf9a",
    onContainer: "#2f2100"
  },
  info: {
    main: "#00639b",
    contrastText: "#ffffff",
    container: "#cde5ff",
    onContainer: "#001d33"
  },
  success: {
    main: "#2e6c2e",
    contrastText: "#ffffff",
    container: "#b1f1a7",
    onContainer: "#002204"
  },
  background: {
    default: "#fdfbff",
    paper: "#ffffff"
  },
  surface: {
    main: "#fdfbff",
    variant: "#e0e2ec",
    onMain: "#1a1c1e",
    onVariant: "#43474e",
    // MD3 surface-container tonal elevation ramp
    container: "#f0f0f7",
    containerLow: "#f6f5fb",
    containerHigh: "#eaeaf1",
    containerHighest: "#e4e4eb"
  },
  outline: {
    main: "#74777f",
    variant: "#c4c6d0"
  },
  text: {
    primary: "#1a1c1e",
    secondary: "#43474e",
    disabled: "rgba(26,28,30,0.38)"
  },
  divider: "#c4c6d0"
};

const darkColors = {
  primary: {
    main: "#4a9eff",
    light: "#80bbff",
    dark: "#007acc",
    contrastText: "#00315c",
    container: "#004a77",
    onContainer: "#cfe5ff"
  },
  secondary: {
    main: "#ffb3b0",
    light: "#ffdad9",
    dark: "#e10032",
    contrastText: "#680010",
    container: "#93000f",
    onContainer: "#ffdad9"
  },
  tertiary: {
    main: "#4fd8eb",
    contrastText: "#00363d",
    container: "#004f58",
    onContainer: "#97f0ff"
  },
  error: {
    main: "#ffb4ab",
    contrastText: "#690005",
    container: "#93000a",
    onContainer: "#ffdad6"
  },
  warning: {
    main: "#f5bd4f",
    contrastText: "#2f2100",
    container: "#765600",
    onContainer: "#ffdf9a"
  },
  info: {
    main: "#94ccff",
    contrastText: "#003354",
    container: "#004a77",
    onContainer: "#cde5ff"
  },
  success: {
    main: "#96d88d",
    contrastText: "#00390a",
    container: "#115314",
    onContainer: "#b1f1a7"
  },
  background: {
    default: "#121212",
    paper: "#181818"
  },
  surface: {
    main: "#121212",
    variant: "#43474e",
    onMain: "#e3e2e6",
    onVariant: "#c3c7cf",
    container: "#1e1e1e",
    containerLow: "#181818",
    containerHigh: "#282828",
    containerHighest: "#333333"
  },
  outline: {
    main: "#8d9199",
    variant: "#43474e"
  },
  text: {
    primary: "#e3e2e6",
    secondary: "#c3c7cf",
    disabled: "rgba(227,226,230,0.38)"
  },
  divider: "#2c2c2c"
};

// ---------------------------------------------------------------------------
// MD3 type scale (Roboto)
// ---------------------------------------------------------------------------
const typography = {
  fontFamily:
    '"Roboto","Helvetica","Arial","Segoe UI",system-ui,sans-serif',
  // MD3 display / headline / title / body / label roles mapped onto MUI slots
  h1: { fontSize: "3.5rem", lineHeight: 1.12, fontWeight: 400, letterSpacing: "-0.015625em" },
  h2: { fontSize: "2.8125rem", lineHeight: 1.16, fontWeight: 400 },
  h3: { fontSize: "2.25rem", lineHeight: 1.22, fontWeight: 400 },
  h4: { fontSize: "2rem", lineHeight: 1.25, fontWeight: 400 },
  h5: { fontSize: "1.75rem", lineHeight: 1.29, fontWeight: 400 },
  h6: { fontSize: "1.375rem", lineHeight: 1.27, fontWeight: 500 },
  subtitle1: { fontSize: "1rem", lineHeight: 1.5, fontWeight: 500, letterSpacing: "0.009375em" },
  subtitle2: { fontSize: "0.875rem", lineHeight: 1.43, fontWeight: 500, letterSpacing: "0.00714em" },
  body1: { fontSize: "1rem", lineHeight: 1.5, fontWeight: 400, letterSpacing: "0.03125em" },
  body2: { fontSize: "0.875rem", lineHeight: 1.43, fontWeight: 400, letterSpacing: "0.017857em" },
  button: { fontSize: "0.875rem", lineHeight: 1.43, fontWeight: 500, letterSpacing: "0.00714em", textTransform: "none" },
  caption: { fontSize: "0.75rem", lineHeight: 1.33, fontWeight: 400, letterSpacing: "0.033em" },
  overline: { fontSize: "0.6875rem", lineHeight: 1.45, fontWeight: 500, letterSpacing: "0.045em", textTransform: "uppercase" }
};

// MD3 shape scale
const shape = { borderRadius: 12 };

// ---------------------------------------------------------------------------
// Component overrides — give MUI an authentic Material You feel
// ---------------------------------------------------------------------------
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      "*": { boxSizing: "border-box" },
      body: { margin: 0 }
    }
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      // MD3 buttons are pill-shaped (full-rounded).
      root: {
        borderRadius: 9999,
        paddingInline: 24,
        minHeight: 40,
        textTransform: "none",
        fontWeight: 500
      },
      sizeSmall: { minHeight: 32, paddingInline: 16 },
      sizeLarge: { minHeight: 48, paddingInline: 28 }
    }
  },
  MuiIconButton: {
    styleOverrides: { root: { borderRadius: 9999 } }
  },
  MuiToggleButton: {
    styleOverrides: { root: { borderRadius: 9999, textTransform: "none" } }
  },
  MuiChip: {
    styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } }
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 12,
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: "none"
      })
    }
  },
  MuiPaper: {
    styleOverrides: { rounded: { borderRadius: 12 } }
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: 28, backgroundImage: "none" }
    }
  },
  MuiTextField: {
    defaultProps: { variant: "outlined", size: "small" }
  },
  MuiOutlinedInput: {
    styleOverrides: { root: { borderRadius: 12 } }
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        borderRadius: 8,
        fontSize: "0.75rem",
        backgroundColor: theme.palette.mode === "dark" ? "#43474e" : "#1a1c1e"
      })
    }
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: "inherit" }
  },
  MuiMenu: {
    styleOverrides: { paper: { borderRadius: 12 } }
  }
};

/**
 * Build a Material Design 3 theme for the given mode.
 * @param {"light"|"dark"} mode
 */
export function createMd3Theme(mode) {
  const c = mode === "dark" ? darkColors : lightColors;
  return createTheme({
    palette: {
      mode,
      primary: c.primary,
      secondary: c.secondary,
      tertiary: c.tertiary,
      error: c.error,
      warning: c.warning,
      info: c.info,
      success: c.success,
      background: c.background,
      surface: c.surface,
      outline: c.outline,
      text: c.text,
      divider: c.divider,
      contrastThreshold: 4.5
    },
    typography,
    shape,
    components
  });
}

export default createMd3Theme;
