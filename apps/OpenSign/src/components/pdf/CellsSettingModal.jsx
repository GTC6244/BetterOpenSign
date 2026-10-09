import { useState, useEffect } from "react";
import ModalUi from "../../primitives/ModalUi";
import { fontsizeArr, fontColorArr } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

export default function CellsSettingModal({
  isOpen,
  handleClose,
  defaultData,
  handleSave,
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [cellCount, setCellCount] = useState(5);
  const [fontSize, setFontSize] = useState(12);
  const [fontColor, setFontColor] = useState("black");

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.options?.name || "Cells");
      setCellCount(defaultData.options?.cellCount || 5);
      setFontSize(defaultData.options?.fontSize || 12);
      setFontColor(defaultData.options?.fontColor || "black");
    }
  }, [defaultData]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSave &&
      handleSave({
        name,
        cellCount: parseInt(cellCount, 10),
        fontSize,
        fontColor,
      });
  };

  return (
    <ModalUi isOpen={isOpen} handleClose={handleClose} title={t("widget-info")}>
      <Box component="form" onSubmit={onSubmit} sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            name="name"
            label={
              <span>
                {t("name")} <Box component="span" sx={{ color: "error.main" }}>*</Box>
              </span>
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{ htmlInput: { required: true } }}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            name="cellCount"
            label={t("cell-count")}
            value={cellCount}
            onChange={(e) => setCellCount(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ alignItems: { md: "center" } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                sx={{ whiteSpace: "nowrap", fontSize: "0.875rem" }}
              >
                {t("font-size")}:{" "}
              </Typography>
              <TextField
                select
                size="small"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                sx={{ minWidth: 80 }}
              >
                {fontsizeArr.map((size, ind) => (
                  <MenuItem value={size} key={ind}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography component="span" sx={{ fontSize: "0.875rem" }}>
                {t("color")}:{" "}
              </Typography>
              <TextField
                select
                size="small"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                sx={{ minWidth: 100, flexGrow: { md: 1 } }}
              >
                {fontColorArr.map((color, ind) => (
                  <MenuItem value={color} key={ind}>
                    {t(`color-type.${color}`)}
                  </MenuItem>
                ))}
              </TextField>
              <Box
                sx={{ width: 20, height: 19, ml: 0.5, background: fontColor }}
              />
            </Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Button type="submit" variant="contained">
            {t("save")}
          </Button>
        </Stack>
      </Box>
    </ModalUi>
  );
}
