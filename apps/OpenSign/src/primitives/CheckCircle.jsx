import Box from "@mui/material/Box";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

/**
 * MD3 success check icon. `color` accepts a theme palette key ("success",
 * "primary", …) or any CSS color; legacy Tailwind values default to success.
 */
const CheckCircle = ({ size = 56, color = "success.main" }) => {
  const resolved =
    typeof color === "string" && color.startsWith("text-") ? "success.main" : color;
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CheckCircleOutlineIcon sx={{ fontSize: size, color: resolved }} />
    </Box>
  );
};

export default CheckCircle;
