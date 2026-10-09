import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PageNotFound = ({ prefix }) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        bgcolor: "surface.main",
        color: "surface.onMain",
        borderRadius: 3
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "60px", lg: "120px" },
            fontWeight: 600,
            lineHeight: 1.1
          }}
        >
          404
        </Typography>
        <Typography sx={{ fontSize: { xs: "30px", lg: "50px" } }}>
          {prefix ? `${prefix} Not Found` : t("page-not-found")}
        </Typography>
      </Box>
    </Box>
  );
};

export default PageNotFound;
