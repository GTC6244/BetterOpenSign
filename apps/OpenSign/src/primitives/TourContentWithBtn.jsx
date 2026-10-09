import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function TourContentWithBtn({
  message,
  isChecked,
  video,
  isDontShowCheckbox = true
}) {
  const { t } = useTranslation();
  const [isCheck, setIsCheck] = useState(true);

  const handleCheck = () => {
    setIsCheck(!isCheck);
    if (isChecked) {
      isChecked(!isCheck);
    }
  };
  return (
    <Box>
      <Typography component="p" sx={{ p: { xs: 0.5, md: 0 } }}>
        {message}
      </Typography>
      {video && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: { md: 300 },
            my: "10px",
            border: "1.3px solid",
            borderColor: "outline.main",
            borderRadius: 1
          }}
        >
          <Box
            component="iframe"
            sx={{ width: "100%", height: "100%", border: 0 }}
            src={video}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </Box>
      )}
      {isDontShowCheckbox && (
        <FormControlLabel
          sx={{ display: "flex", justifyContent: "center", mt: 1.5, mx: 0 }}
          control={
            <Checkbox size="small" checked={isCheck} onChange={handleCheck} />
          }
          label={
            <Typography sx={{ color: "text.secondary", fontSize: "12px" }}>
              {t("tour-content")}
            </Typography>
          }
        />
      )}
    </Box>
  );
}
