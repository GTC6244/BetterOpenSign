import { useMemo, useState } from "react";
import ModalUi from "./ModalUi";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

/**
 * PasswordResetModal
 * - Validates password rules (length >= 8, upper, lower, digit, special)
 * - Buttons: Submit, Autogenerate (12 chars), Copy (Font Awesome icon only)
 * - `Autogenerate` fills a valid 12-char password but remains editable
 * - `Copy` copies the current password to clipboard
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSubmit: (password: string) => Promise<void> | void
 */
export default function PasswordResetModal({
  userId,
  isOpen,
  onClose,
  onSubmit,
  showAlert
}) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validation helpers
  const rules = useMemo(
    () => ({
      hasUpper: /[A-Z]/,
      hasLower: /[a-z]/,
      hasDigit: /\d/,
      // Richer special set including common keyboard symbols
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
      minLen: 8
    }),
    []
  );

  const checks = useMemo(() => {
    return {
      lenOK: password.length >= rules.minLen,
      upperLowerDigitOK:
        rules.hasUpper.test(password) &&
        rules.hasLower.test(password) &&
        rules.hasDigit.test(password),
      specialOK: rules.hasSpecial.test(password)
    };
  }, [password, rules]);

  // Always-present condition list with per-condition status
  const conditions = useMemo(
    () => [
      {
        key: "len",
        ok: checks.lenOK,
        text: "password-length"
      },
      {
        key: "uld",
        ok: checks.upperLowerDigitOK,
        text: "password-case"
      },
      {
        key: "spec",
        ok: checks.specialOK,
        text: "password-special-case"
      }
    ],
    [checks]
  );

  const allValid = conditions.every((c) => c.ok) && password.length > 0;

  // Autogenerate a valid random password (12 chars)
  const handleAutogen = () => {
    const length = 12;
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // omit ambiguous I/O
    const lower = "abcdefghijkmnopqrstuvwxyz"; // omit ambiguous l
    const digits = "23456789"; // omit 0/1
    const special = "!@#$%^&*()-_=+[]{};:,.?";
    const all = upper + lower + digits + special;

    function pick(str) {
      return str[Math.floor(Math.random() * str.length)];
    }
    function shuffle(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }

    let pwd = [pick(upper), pick(lower), pick(digits), pick(special)];
    while (pwd.length < length) pwd.push(pick(all));
    pwd = shuffle(pwd).join("");

    setPassword(pwd);
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      showAlert("success", t("copied"), 1200);
      setCopied(true);
      setTimeout(() => setCopied(false, 1200));
    } catch (e) {
      console.error("Clipboard error", e);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!allValid) return; // guard
    try {
      setSubmitting(true);
      await onSubmit?.(userId, password);
      setSubmitting(false);
      onClose?.();
      setPassword("");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <>
      <ModalUi
        isOpen={isOpen}
        title={t("reset-password")}
        handleClose={() => {
          setPassword("");
          onClose?.();
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ pt: "15px", p: "20px", display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("enter-strong-password")}
          </Typography>
          <Box>
            <Typography
              component="label"
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary" }}
            >
              {t("new-password")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                fullWidth
                size="small"
                type="text"
                placeholder={t("enter-password-or-click-autogenerate")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <IconButton
                type="button"
                size="small"
                onClick={handleCopy}
                title={copied ? "Copied" : "Copy"}
                aria-label="Copy password"
                disabled={!password}
                sx={{ opacity: copied ? 0.7 : 1 }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* When everything is valid, show just a right tick */}
          <Box component="ul" sx={{ mt: 0.5, ml: 1, pl: 2, listStyle: "none" }}>
            {conditions.map((c) => (
              <Typography
                key={c.key}
                component="li"
                sx={{
                  color: c.ok ? "success.main" : "error.main",
                  fontSize: "12px",
                  lineHeight: 1.35
                }}
              >
                {c.ok ? "✓" : "✗"} {t(c.text)}
              </Typography>
            ))}
          </Box>

          <Box sx={{ pt: 1, display: "flex", flexDirection: "row", gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!allValid || submitting}
            >
              {t("submit")}
            </Button>
            <Button type="button" variant="contained" color="inherit" onClick={handleAutogen}>
              {t("autogenerate")}
            </Button>
            <Button
              type="button"
              variant="text"
              onClick={() => {
                setPassword("");
                onClose?.();
              }}
            >
              {t("cancel")}
            </Button>
          </Box>
        </Box>
      </ModalUi>
    </>
  );
}
