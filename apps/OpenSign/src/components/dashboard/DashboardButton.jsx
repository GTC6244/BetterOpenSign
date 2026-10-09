import React from "react";
import { useNavigate } from "react-router";
import { openInNewTab } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const DashboardButton = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function openReport() {
    if (props.Data && props.Data.Redirect_type) {
      const Redirect_type = props.Data.Redirect_type;
      const id = props.Data.Redirect_id;
      if (Redirect_type === "Form") {
        navigate(`/form/${id}`);
      } else if (Redirect_type === "Report") {
        navigate(`/report/${id}`);
      } else if (Redirect_type === "Url") {
        openInNewTab(id);
      }
    }
  }
  const isClickable = !!(props.Data && props.Data.Redirect_type);
  return (
    <Card
      onClick={() => openReport()}
      elevation={3}
      sx={{
        width: "100%",
        px: 1.5,
        py: 1,
        bgcolor: "surface.main",
        cursor: isClickable ? "pointer" : "default"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          color: "text.primary"
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Box
            sx={{
              borderRadius: "50%",
              bgcolor: "surface.containerHighest",
              width: 60,
              height: 60,
              alignSelf: "flex-start",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <i
              className={`${props.Icon ? props.Icon : "fa-light fa-info"} text-[25px] lg:text-[30px]`}
            ></i>
          </Box>
        </Box>
        <Box sx={{ ml: 1.5 }}>
          <Typography sx={{ fontSize: "1.125rem" }}>
            {t(`sidebar.${props.Label}`)}
          </Typography>
          {props.Label === "Sign yourself" && (
            <Typography sx={{ color: "text.secondary", fontSize: "0.75rem", mt: 0.5 }}>
              {t("signyour-self-button")}
            </Typography>
          )}
          {props.Label === "Request signatures" && (
            <Typography sx={{ color: "text.secondary", fontSize: "0.75rem", mt: 0.5 }}>
              {t("requestsign-button")}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default DashboardButton;
