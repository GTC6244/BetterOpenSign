import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

export default function CellsInput(props) {
  const { t } = useTranslation();
  return (
    <Box sx={{ width: "100%" }}>
      <input
        type="text"
        placeholder={props?.hint || t("widgets-name.text")}
        value={props?.cellsValue ?? ""}
        onChange={(e) => props?.handleCellsInput(e)}
        className={`${props?.textInputcls} pr-4`}
        onBlur={props?.handleValidation || props?.handleValidation}
        maxLength={props?.count}
      />
    </Box>
  );
}
