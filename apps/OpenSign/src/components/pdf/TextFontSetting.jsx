import ModalUi from "../../primitives/ModalUi";
import { fontColorArr, fontsizeArr } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

function TextFontSetting(props) {
  const { t } = useTranslation();
  return (
    <ModalUi
      headerColor={"#dc3545"}
      isOpen={props.isTextSetting}
      reduceWidth={"max-w-[350px]"}
      title={t("text-field")}
      handleClose={() => props.setIsTextSetting(false)}
    >
      <Box sx={{ height: "100%", p: "20px", color: "text.primary" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
            gap: 1.5
          }}
        >
          {/* Font Size Selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography component="span" sx={{ whiteSpace: "nowrap" }}>
              {t("font-size")}:
            </Typography>
            <TextField
              select
              size="small"
              sx={{ ml: "7px", width: "60%" }}
              value={
                props.fontSize ||
                props.currWidgetsDetails?.options?.fontSize ||
                12
              }
              onChange={(e) => props.setFontSize(parseInt(e.target.value))}
            >
              {fontsizeArr.map((size, ind) => (
                <MenuItem key={ind} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {/* Font Color Selector */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography component="span" sx={{ whiteSpace: "nowrap" }}>
              {t("color")}:
            </Typography>
            <TextField
              select
              size="small"
              sx={{ ml: { xs: "33px", md: 2 }, width: { xs: "65%", md: "100%" } }}
              value={
                props.fontColor ||
                props.currWidgetsDetails?.options?.fontColor ||
                "black"
              }
              onChange={(e) => props.setFontColor(e.target.value)}
            >
              {fontColorArr.map((color, ind) => (
                <MenuItem key={ind} value={color}>
                  {t(`color-type.${color}`)}
                </MenuItem>
              ))}
            </TextField>
            {/* Color Preview Box */}
            <Box
              sx={{
                width: 20,
                height: 20,
                ml: 1,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "outline.variant",
                backgroundColor:
                  props.fontColor ||
                  props.currWidgetsDetails?.options?.fontColor ||
                  "black"
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mt: "15px", mb: 1 }} />
        <Button
          onClick={() => props.handleSaveFontSize()}
          type="button"
          variant="contained"
          sx={{ mt: 1 }}
        >
          {t("save")}
        </Button>
      </Box>
    </ModalUi>
  );
}

export default TextFontSetting;
