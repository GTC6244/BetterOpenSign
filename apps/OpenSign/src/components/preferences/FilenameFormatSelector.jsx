import { useState, useEffect, useMemo } from "react";
import Parse from "parse";
import { buildDownloadFilename } from "../../utils";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "../../primitives/Tooltip";

/**
 * Enum-like list of supported filename format IDs and their labels
 * Keep IDs stable; you can freely change labels for UX.
 */
const FILENAME_FORMATS = [
  { id: "DOCNAME", label: "document Name.pdf" },
  { id: "DOCNAME_SIGNED", label: "document Name - Signed.pdf" },
  { id: "DOCNAME_EMAIL", label: "document Name - name@domain.com.pdf" },
  {
    id: "DOCNAME_EMAIL_DATE",
    label: "document Name - name@domain.com - date.pdf"
  }
];

const FilenameFormatSelector = ({ fileNameFormat, setFileNameFormat }) => {
  const { t } = useTranslation();
  const sampleDocName = "Agreement";
  const [value, setValue] = useState(fileNameFormat);
  const [error, setError] = useState("");
  const currentUser = Parse?.User?.current();
  const email = currentUser?.get("email") || "user@example.com";

  // Load preference from contracts_User
  useEffect(() => {
    (async () => {
      try {
        if (!currentUser) return;
        const rec = await Parse.Cloud.run("getUserDetails");
        if (rec) {
          const fmt = rec.get("DownloadFilenameFormat");
          if (fmt) setValue(fmt);
        }
      } catch (e) {
        console.error("Load filename pref failed", e);
        setError(e?.message || String(e));
      }
    })();
  }, [currentUser]);

  const preview = useMemo(() => {
    return buildDownloadFilename(value, {
      docName: sampleDocName,
      email,
      isSigned: true // preview with signed true for that option
    });
  }, [value, email, sampleDocName]);

  async function savePreference(nextValue) {
    setFileNameFormat(nextValue);
  }
  return (
    <Box sx={{ maxWidth: 400, pr: "20px" }}>
      <Typography
        component="label"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 14,
          mb: "0.7rem",
          fontWeight: 500
        }}
      >
        {t("document-download-filename-format")}
        <Tooltip
          id="filename-tooltip"
          maxWidth
          message={t("download-filename-format-help")}
        />
      </Typography>
      <TextField
        select
        size="small"
        fullWidth
        value={value}
        onChange={async (e) => {
          const v = e.target.value;
          setValue(v);
          await savePreference(v);
        }}
        sx={{ "& .MuiInputBase-input": { fontSize: 11 } }}
      >
        {FILENAME_FORMATS.map((opt) => (
          <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 11 }}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
        {t("preview")}
        <Box component="span" sx={{ fontWeight: 500 }}>
          {preview}
        </Box>
      </Box>
      {error && (
        <Box sx={{ mt: 1, fontSize: 12, color: "error.main" }}>{error}</Box>
      )}
    </Box>
  );
};

export default FilenameFormatSelector;
