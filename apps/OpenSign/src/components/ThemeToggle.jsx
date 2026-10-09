import Switch from "@mui/material/Switch";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useThemeMode } from "../theme/ThemeModeProvider";

/**
 * Material Design 3 light/dark toggle. Mode state lives in ThemeModeProvider,
 * which drives both the MUI theme and the legacy `data-theme` attribute.
 */
const ThemeToggle = () => {
  const { isDark, toggleMode } = useThemeMode();

  return (
    <Switch
      id="dark-mode-toggle"
      checked={isDark}
      onChange={toggleMode}
      color="primary"
      inputProps={{ "aria-label": "Toggle dark mode" }}
      icon={<LightModeOutlinedIcon sx={{ fontSize: 16, color: "#fbbf24" }} />}
      checkedIcon={<DarkModeOutlinedIcon sx={{ fontSize: 16, color: "#4a9eff" }} />}
      sx={{
        "& .MuiSwitch-switchBase": { padding: "7px" },
        "& .MuiSwitch-thumb": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }}
    />
  );
};

export default ThemeToggle;
