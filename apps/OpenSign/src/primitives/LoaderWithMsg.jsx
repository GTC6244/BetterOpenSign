import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Loader from "./Loader";

function LoaderWithMsg({ isLoading }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: 1.5
      }}
    >
      <Loader />
      <Typography variant="caption" sx={{ color: "text.primary" }}>
        {isLoading.message}
      </Typography>
    </Box>
  );
}

export default LoaderWithMsg;
