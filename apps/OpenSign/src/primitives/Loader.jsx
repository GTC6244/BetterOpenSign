import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

/**
 * MD3 circular progress indicator (replaces the DaisyUI infinity spinner).
 */
const Loader = ({ size = 56, color = "primary" }) => {
  return (
    <Box
      sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      <CircularProgress size={size} color={color} thickness={4} />
    </Box>
  );
};

export default Loader;
