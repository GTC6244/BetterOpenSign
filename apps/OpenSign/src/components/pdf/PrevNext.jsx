import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function PrevNext({ pageNumber, allPages, changePage }) {
  const { t } = useTranslation();
  //for go to previous page
  function previousPage() {
    changePage(-1);
  }
  //for go to next page
  function nextPage() {
    changePage(1);
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        variant="contained"
        color="inherit"
        size="small"
        disabled={pageNumber <= 1}
        onClick={previousPage}
        sx={{ minWidth: 0, px: 1.5, fontWeight: 600 }}
      >
        <Box component="i" className="fa-light fa-chevron-up" aria-hidden="true" />
      </Button>
      <Typography
        component="span"
        sx={{
          fontSize: { xs: "0.75rem", "2xl": "20px" },
          color: "text.primary",
          fontWeight: 500,
          mx: 1
        }}
      >
        {pageNumber || (allPages ? 1 : "--")} {t("of")} {allPages || "--"}
      </Typography>
      <Button
        variant="contained"
        color="inherit"
        size="small"
        disabled={pageNumber >= allPages}
        onClick={nextPage}
        sx={{ minWidth: 0, px: 1.5, fontWeight: 600 }}
      >
        <Box
          component="i"
          className="fa-light fa-chevron-down"
          aria-hidden="true"
        />
      </Button>
    </Box>
  );
}

export default PrevNext;
