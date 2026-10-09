import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function TypeSignature(props) {
  const { t } = useTranslation();
  return (
    <Box>
      <Box
        className="tabWidth"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "4px"
        }}
      >
        <Typography
          component="span"
          sx={{
            ml: "5px",
            fontSize: "12px",
            color: "text.primary",
            whiteSpace: "nowrap"
          }}
        >
          {props?.currWidgetsDetails?.type === "initials"
            ? t("initial-teb")
            : t("signature-tab")}
          :
        </Typography>
        <TextField
          variant="standard"
          fullWidth
          placeholder={
            props?.currWidgetsDetails?.type === "initials"
              ? t("initial-type")
              : t("signature-type")
          }
          value={props?.typedSignature}
          onChange={(e) => {
            props?.setTypedSignature(e.target.value);
            if (e.target.value?.trim()?.length > 0) {
              props?.convertToImg(props?.fontSelect, e.target.value);
            }
          }}
          slotProps={{
            htmlInput: {
              maxLength:
                props?.currWidgetsDetails?.type === "initials" ? 3 : 30,
              style: {
                fontFamily: props?.fontSelect,
                color: props?.penColor,
                fontSize: "20px"
              }
            }
          }}
          sx={{ ml: 0.5 }}
        />
      </Box>
      <Box
        className="tabWidth"
        sx={{
          border: "1px solid",
          borderColor: "outline.variant",
          mt: "10px",
          borderRadius: "4px"
        }}
      >
        {props?.fontOptions.map((font, ind) => {
          return (
            <Box
              key={ind}
              onClick={() => {
                props?.setFontSelect(font.value);
                props?.convertToImg(font.value, props?.typedSignature);
              }}
              sx={{
                cursor: "pointer",
                fontFamily: font.value,
                bgcolor:
                  props?.fontSelect === font.value
                    ? "action.selected"
                    : "transparent"
              }}
            >
              <Box
                sx={{ py: "5px", px: "10px", fontSize: "20px", color: props?.penColor }}
              >
                {props?.typedSignature
                  ? props?.typedSignature
                  : t("Your-Signature")}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default TypeSignature;
