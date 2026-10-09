import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import juice from "juice";
import { Trans, useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";

const EmailBodyEditor = ({
  value,
  onChange,
  smallscreen = false,
  bodyName,
  isReset = false,
  isTemplateLoaded
}) => {
  const { t } = useTranslation();
  const [inputHtml, setInputHtml] = useState("");
  const [cleanPreview, setCleanPreview] = useState("");

  useEffect(() => {
    initProcessContent();
  }, [isTemplateLoaded]);

  useEffect(() => {
    if (isReset) {
      initProcessContent(value);
    }
  }, [isReset]);

  const initProcessContent = () => {
    // 1. Sanitize immediately to strip scripts/malicious tags
    const sanitized = DOMPurify.sanitize(value, {
      USE_PROFILES: { html: true }, // Ensures basic HTML structure
      ADD_ATTR: ["target"] // Allow links to open in new tabs
    });

    // 2. Inline CSS for email compatibility
    // Note: Juice is fast, but for huge files, you might debounce this
    try {
      const inlined = juice(sanitized);
      setInputHtml(inlined);
      onChange?.(inlined);
      setCleanPreview(inlined);
    } catch (err) {
      onChange?.(sanitized);
      setInputHtml(sanitized); // Fallback if juice fails
      setCleanPreview(sanitized);
    }
  };

  const processContent = (value) => {
    // 1. Sanitize immediately to strip scripts/malicious tags
    const sanitized = DOMPurify.sanitize(value, {
      USE_PROFILES: { html: true }, // Ensures basic HTML structure
      ADD_ATTR: ["target"] // Allow links to open in new tabs
    });

    // 2. Inline CSS for email compatibility
    // Note: Juice is fast, but for huge files, you might debounce this
    try {
      const inlined = juice(sanitized);
      setCleanPreview(inlined);
      onChange?.(inlined);
    } catch (err) {
      setCleanPreview(sanitized); // Fallback if juice fails
      onChange?.(sanitized);
    }
  };
  const handleChange = (e) => {
    const value = e.target.value;
    setInputHtml(value);
    processContent(value);
  };

  const flexDirection = smallscreen
    ? "column"
    : { xs: "column", md: "row" };
  const template =
    bodyName === "request"
      ? "#sample/requestemail"
      : bodyName === "completion"
        ? "#sample/completionemail"
        : "#";
  return (
    <>
      <Typography variant="body2" component="p">
        <Trans i18nKey={"open-email-builder"}>
          {"You can create email template using "}
          <Link
            href={`/emailbuilder${template}`}
            target="_blank"
            referrerPolicy="no-referrer"
            color="primary"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            email builder
          </Link>
          {" platform and copy html code."}
        </Trans>
      </Typography>
      <Box sx={{ display: "flex", flexDirection, gap: 2.5 }}>
        {/* Editor Pane */}
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", mt: 1 }}>
          <Box component="label">{t("paste-html-here")}:</Box>
          <TextField
            multiline
            value={inputHtml}
            onChange={(e) => handleChange(e)}
            placeholder="<html><body><h1>Hello!</h1></body></html>"
            sx={{
              flex: 1,
              mt: 0.5,
              "& .MuiInputBase-root": {
                alignItems: "flex-start",
                minHeight: "70vh",
                fontSize: "0.75rem"
              },
              "& textarea": { minHeight: "66vh !important" }
            }}
          />
        </Box>

        {/* Live Preview Pane */}
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", mt: 1 }}>
          <Box component="label">{t("preview")}</Box>
          <Box
            sx={{
              flex: 1,
              mt: 0.5,
              bgcolor: "#fff",
              border: "1px solid",
              borderColor: "outline.variant",
              borderRadius: 1,
              minHeight: "70vh"
            }}
          >
            {cleanPreview && (
              <Box
                component="iframe"
                title="Safe Preview"
                srcDoc={cleanPreview}
                // SECURITY: sandbox prevents scripts from running even if they slip through
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                sx={{ width: "100%", minHeight: "70vh", border: 0 }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default EmailBodyEditor;
