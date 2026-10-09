import MuiAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";

/**
 * MD3 alert / snackbar-style banner.
 *
 * Preserves the legacy API:
 *   - `type`: "success" | "info" | "danger" | "warning" (danger → error)
 *   - `className`: when provided, overrides the default fixed-top positioning.
 */
const SEVERITY = {
  success: "success",
  info: "info",
  danger: "error",
  warning: "warning"
};

const Alert = ({ children, type, className }) => {
  if (!children) return null;
  const severity = SEVERITY[type] || "info";

  const positioned = !className;

  return (
    <Box
      className={className || undefined}
      sx={
        positioned
          ? {
              zIndex: 1300,
              position: "fixed",
              top: 80,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: "90vw"
            }
          : undefined
      }
    >
      <MuiAlert
        severity={severity}
        variant="filled"
        sx={{ borderRadius: 3, alignItems: "center", boxShadow: 3 }}
      >
        {children}
      </MuiAlert>
    </Box>
  );
};

export default Alert;
