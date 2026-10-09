import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// MD3 default typeface
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createMd3Theme } from "./md3Theme";

const ThemeModeContext = createContext({
  mode: "light",
  isDark: false,
  toggleMode: () => {},
  setMode: () => {}
});

/** Read the initial mode from localStorage (shared with the legacy toggle). */
function getInitialMode() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

/** Keep the legacy DaisyUI `data-theme` attribute in sync during migration. */
function applyLegacyAttribute(mode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(
    "data-theme",
    mode === "dark" ? "opensigndark" : "opensigncss"
  );
}

/**
 * Single source of truth for light/dark mode. Provides the MUI MD3 theme and
 * `CssBaseline`, and mirrors the mode onto the legacy `data-theme` attribute so
 * not-yet-migrated DaisyUI components keep rendering correctly.
 */
export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(getInitialMode);

  const setMode = (next) => {
    setModeState(next);
    localStorage.setItem("theme", next === "dark" ? "dark" : "light");
    applyLegacyAttribute(next);
  };

  const toggleMode = () => setMode(mode === "dark" ? "light" : "dark");

  // Ensure the attribute matches on first mount (covers SSR/hydration + reloads).
  useEffect(() => {
    applyLegacyAttribute(mode);
  }, [mode]);

  const theme = useMemo(() => createMd3Theme(mode), [mode]);

  const ctx = useMemo(
    () => ({ mode, isDark: mode === "dark", toggleMode, setMode }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={ctx}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

/** Access + control the current light/dark mode from anywhere in the tree. */
export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export default ThemeModeProvider;
