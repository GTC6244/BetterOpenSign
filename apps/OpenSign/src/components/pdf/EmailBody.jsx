import Tooltip from "../../primitives/Tooltip";
import { useTranslation } from "react-i18next";
import EmailEditor from "../emaileditor";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export function EmailBody(props) {
  const { t } = useTranslation();
  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        color: "text.primary",
        fontSize: "1.125rem",
        fontWeight: 400
      }}
    >
      <Box
        sx={{
          m: { xs: 1, md: 5 },
          p: { xs: 1.5, md: 5 },
          boxShadow: 2,
          "&:hover": { boxShadow: 4 },
          border: "1px solid",
          borderColor: "primary.main",
          borderRadius: 1
        }}
      >
        <Typography component="label" sx={{ fontSize: "0.875rem", ml: 1 }}>
          {t("subject")} <Tooltip message={t("email-subject")} />
        </Typography>
        <TextField
          fullWidth
          size="small"
          required
          value={props.requestSubject}
          onChange={(e) => props?.onChangeSubject?.(e.target.value)}
          placeholder={'${senderName} has requested you to sign "${documentName}"'}
          slotProps={{
            htmlInput: {
              onInvalid: (e) => e.target.setCustomValidity(t("input-required")),
              onInput: (e) => e.target.setCustomValidity("")
            }
          }}
        />
        <Box
          component="label"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.875rem",
            ml: 1,
            mt: 1.5
          }}
        >
          <Box component="span">
            {t("body")} <Tooltip message={t("email-body")} />
          </Box>
          <Link
            component="button"
            color="primary"
            underline="hover"
            onClick={(e) => props?.handleSwitch(e)}
          >
            {props?.emailEditorType === "basic"
              ? t("switch-to-advanced")
              : t("switch-to-basic")}
          </Link>
        </Box>
        <Box sx={{ px: 0.5, py: 1, width: "100%", fontSize: "0.75rem" }}>
          <EmailEditor
            type={props?.emailEditorType}
            values={props.requestBody}
            onChange={props?.onChangeBody}
            isReset={props?.isReset}
            smallscreen
          />
        </Box>
      </Box>
    </Box>
  );
}
