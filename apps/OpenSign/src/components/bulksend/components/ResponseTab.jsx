import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function ResponseTab({
  prefillCount = 0,
  documentCount = 0,
  message = { status: "", message: "" }
}) {
  const { t } = useTranslation();
  const { status, message: msg } = message;
  return (
    <Card sx={{ p: 2, m: { xs: 1.5, md: 3 } }}>
      <Typography sx={{ fontWeight: 500 }}>{t("summary")}</Typography>
      <Box
        component="ul"
        sx={{
          mt: 1,
          pl: 2.5,
          listStyleType: "disc",
          color: "text.secondary"
        }}
      >
        <li>
          {t("prefill-fields")}: {prefillCount}
        </li>
        <li>
          {t("documents")}: {documentCount}
        </li>
        <li>
          {t("status")}: {status}
        </li>
        {msg && (
          <li>
            {t("message")}: {msg}
          </li>
        )}
      </Box>
    </Card>
  );
}

export default ResponseTab;
