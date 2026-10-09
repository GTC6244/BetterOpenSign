import React from "react";
import ModalUi from "../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";

function RotateAlert(props) {
  const { t } = useTranslation();
  return (
    <ModalUi
      isOpen={props.showRotateAlert}
      title={t("Rotation-alert")}
      handleClose={() => props.setShowRotateAlert({ status: false, degree: 0 })}
    >
      <Box sx={{ p: "20px", height: "100%" }}>
        <Typography>{t("rotate-alert-mssg")}</Typography>
        <Divider sx={{ my: "15px" }} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={() => props.handleRemoveWidgets()}
            type="button"
            variant="contained"
          >
            {t("yes")}
          </Button>
          <Button
            onClick={() =>
              props.setShowRotateAlert({ status: false, degree: 0 })
            }
            type="button"
            variant="outlined"
            color="inherit"
          >
            {t("no")}
          </Button>
        </Box>
      </Box>
    </ModalUi>
  );
}

export default RotateAlert;
