import "../../styles/signature.css";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
function Signedby(props) {
  const { t } = useTranslation();
  const getFirstLetter = (pdfData) => {
    const name = props.isSelfSign
      ? (pdfData?.Signers && pdfData?.Signers[0]?.Name) || "User"
      : pdfData.ExtUserPtr?.Name;
    const firstLetter = name.charAt(0);
    return firstLetter;
  };
  return (
    <Box
      sx={{
        display: { xs: "none", md: "block" },
        width: "100%",
        height: "100%",
        bgcolor: "background.paper"
      }}
    >
      <Box
        sx={{
          mx: 1,
          pr: 1,
          pt: 1,
          pb: 0.5,
          fontSize: "15px",
          fontWeight: 600,
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        {props.isSelfSign ? t("user") : t("signed-by")}
      </Box>
      <Box sx={{ mt: "2px", bgcolor: "background.paper" }}>
        <Box
          sx={{
            bgcolor: "#93a3db",
            borderRadius: "12px",
            mx: 0.5,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            py: "10px"
          }}
        >
          <Box
            sx={{
              bgcolor: "#576081",
              display: "flex",
              width: "30px",
              height: "30px",
              borderRadius: "9999px",
              justifyContent: "center",
              alignItems: "center",
              mx: 0.5
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: "12px",
                textAlign: "center",
                fontWeight: 700,
                color: "common.white",
                textTransform: "uppercase"
              }}
            >
              {getFirstLetter(props.pdfDetails)}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box
              component="span"
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#424242",
                width: "100px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {props.isSelfSign
                ? (props.pdfDetails?.Signers &&
                    props.pdfDetails?.Signers[0]?.Name) ||
                  "User"
                : props.pdfDetails.ExtUserPtr.Name || "User"}
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: "10px",
                fontWeight: 500,
                color: "#424242",
                width: "100px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {props.isSelfSign
                ? (props.pdfDetails?.Signers &&
                    props.pdfDetails?.Signers[0]?.Email) ||
                  ""
                : props.pdfDetails.ExtUserPtr.Email || ""}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Signedby;
