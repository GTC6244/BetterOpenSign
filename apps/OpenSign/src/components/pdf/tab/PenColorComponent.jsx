import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

const ALLOWED_COLORS = ["blue", "red", "black"];

// Pen ink colors — these are the literal ink colors the signer picks, not
// theme roles, so they map to concrete CSS color keywords.
const COLOR_VALUE = {
  blue: "blue",
  red: "red",
  black: "black",
  white: "white"
};

function PenColorComponent({
  providedColors,
  penColor,
  convertToImg,
  fontSelect,
  typedSignature,
  setPenColor,
  hideLabel = false,
  penSize
}) {
  const { t } = useTranslation();

  const pensList = useMemo(() => {
    const allowed = new Set(ALLOWED_COLORS);
    const filtered = Array.isArray(providedColors)
      ? providedColors
          .map((c) => String(c).toLowerCase())
          .filter((c) => allowed.has(c))
      : [];

    // remove duplicates while preserving order
    return filtered.length ? [...new Set(filtered)] : ALLOWED_COLORS;
  }, [providedColors]);

  const penFontSize = penSize === "sm" ? "14px" : "16px";
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        m: "5px",
        gap: penSize === "sm" ? 1 : 1.5
      }}
    >
      {!hideLabel && (
        <Box component="span" sx={{ color: "text.primary" }}>
          {t("options")}
        </Box>
      )}
      {pensList.map((color) => {
        const selected = penColor === color;
        return (
          <Box
            component="i"
            key={color}
            role="button"
            tabIndex={0}
            aria-label={`Select ${color} pen`}
            className="fa-light fa-pen-nib"
            onClick={() => {
              setPenColor?.(color);
              convertToImg && convertToImg?.(fontSelect, typedSignature, color);
            }}
            sx={{
              color: COLOR_VALUE[color] || "text.primary",
              borderBottom: "2px solid",
              borderColor: selected ? "currentColor" : "transparent",
              pb: "2px",
              cursor: "pointer",
              fontSize: penFontSize
            }}
          />
        );
      })}
    </Box>
  );
}
export default PenColorComponent;
