import { useState } from "react";
import { useTranslation } from "react-i18next";
import AgreementContent from "./AgreementContent";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function AgreementSign(props) {
  const { t } = useTranslation();
  const [isShowAgreeTerms, setIsShowAgreeTerms] = useState(false);

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 448,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.3)"
        }}
      >
        <Paper
          className="hide-scrollbar"
          sx={{
            width: { xs: "95%", md: "60%", lg: "40%" },
            maxHeight: "90%",
            overflowY: "auto",
            fontSize: "0.875rem",
            p: 2
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Typography
              sx={{
                fontSize: { xs: "11px", md: "1rem" },
                color: "text.primary"
              }}
            >
              <Box component="span">{t("agree-p1")}</Box>
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "primary.main", cursor: "pointer" }}
                onClick={() => {
                  setIsShowAgreeTerms(true);
                }}
              >
                {t("agree-p2")}
              </Box>
              <Box component="span"> {t("agree-p3")}</Box>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", mt: 1.5 }}>
            <Button
              onClick={() => {
                props.setIsAgree(true);
                props.showFirstWidget();
              }}
              variant="contained"
              size="small"
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              {t("agrre-button")}
            </Button>
          </Box>
          <Box sx={{ mt: 1, color: "text.primary" }}>
            <Box component="span" sx={{ fontSize: "11px" }}>
              {t("agreement-note")}
            </Box>
          </Box>
        </Paper>
      </Box>
      {isShowAgreeTerms && (
        <AgreementContent
          setIsAgree={props.setIsAgree}
          setIsShowAgreeTerms={setIsShowAgreeTerms}
          showFirstWidget={props.showFirstWidget}
        />
      )}
    </>
  );
}

export default AgreementSign;
