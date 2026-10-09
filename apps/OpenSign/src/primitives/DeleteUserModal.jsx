import { useState, useEffect, useMemo, useRef } from "react";
import ModalUi from "./ModalUi";
import Loader from "./Loader";
import { Trans, useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const DeleteUserModal = ({
  isOpen,
  userEmail,
  deleting = false,
  deleteRes,
  onConfirm,
  handleClose
}) => {
  const { t } = useTranslation();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Reset and focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmEmail("");
      setError(null);
      // small timeout to ensure the modal is mounted before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Adjust matching rule as needed (strict vs case-insensitive)
  const isMatch = useMemo(() => {
    const a = confirmEmail.trim().toLowerCase();
    const b = userEmail.trim().toLowerCase();
    return a.length > 0 && a === b;
  }, [confirmEmail, userEmail]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setError(null);
    if (!isMatch || deleting) return;
    try {
      await onConfirm();
    } catch (err) {
      console.log("err ", err);
      setError(err?.message || t("something-went-wron-mssg"));
    }
  };

  return (
    <ModalUi
      title={t("delete-account")}
      isOpen={isOpen}
      handleClose={() => !deleting && handleClose()}
    >
      {deleting ? (
        <Box
          sx={{
            height: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Loader />
        </Box>
      ) : (
        <>
          {deleteRes ? (
            <Box
              sx={{
                height: 100,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: { xs: "0.875rem", md: "1rem" }
              }}
            >
              {deleteRes}
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={(e) => handleSubmit(e)}
              sx={{ px: 3, mt: 1, mb: 1.5, color: "text.primary" }}
            >
              <Typography sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                {t("delete-account-que-user")}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="caption"
                  component="p"
                  sx={{ mb: 0.5, color: "text.primary" }}
                >
                  <Trans
                    i18nKey={"please-type-to-confirm"}
                    values={{ userEmail }}
                    components={{ 1: <b /> }}
                  />
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  inputRef={inputRef}
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value?.trim())}
                  required
                  error={!isMatch && confirmEmail.length > 0}
                  helperText={
                    !isMatch && confirmEmail.length > 0
                      ? t("email-does-not-match")
                      : error
                        ? error
                        : " "
                  }
                />
              </Box>

              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ width: 100 }}
                  disabled={!isMatch || deleting}
                  aria-disabled={!isMatch || deleting}
                  title={!isMatch ? t("type-exact-email-delete") : t("delete")}
                >
                  {t("delete")}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ width: 100 }}
                  onClick={handleClose}
                >
                  {t("cancel")}
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </ModalUi>
  );
};

export default DeleteUserModal;
