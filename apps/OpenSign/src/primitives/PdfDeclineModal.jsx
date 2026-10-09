import React, { useState } from "react";
import "../styles/signature.css";
import { useTranslation } from "react-i18next";
import Loader from "./Loader";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

function CustomModal(props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [isExtendExpiry, setIsExtendExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const localuser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  );

  const currentUser = JSON.parse(localuser);
  const isCreator = props?.doc
    ? props?.doc?.CreatedBy?.objectId === currentUser?.objectId &&
      localStorage.getItem("_user_role") !== "Guest"
    : false;
  const handleExtendBtn = () => setIsExtendExpiry(!isExtendExpiry);

  const handleUpdateExpiry = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (expiryDate) {
      props.handleExpiry && props.handleExpiry(expiryDate);
    } else {
      alert(t("expiry-date-error"));
    }
  };

  return (
    props.show && (
      <Dialog
        open={!!props.show}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              position: "relative",
              overflowY: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              fontSize: "0.875rem",
              width: { xs: "95%", md: "60%", lg: "40%" },
              maxWidth: "95vw"
            }
          }
        }}
      >
        {props?.isLoader && (
          <Box
            sx={{
              position: "absolute",
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              bgcolor: "rgba(230,242,242,0.8)"
            }}
          >
            <Loader />
          </Box>
        )}
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "text.primary",
            pt: "15px",
            px: "20px"
          }}
        >
          {props?.headMsg && props?.headMsg}
        </DialogTitle>
        {!isExtendExpiry && (
          <Box sx={{ p: "10px", px: "20px", fontSize: "15px", color: "text.primary" }}>
            {props.bodyMssg && props.bodyMssg}
          </Box>
        )}
        {!isExtendExpiry && (
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            {isCreator && (
              <Button
                variant="contained"
                color="primary"
                sx={{ px: 3, ml: "20px", mb: 1.5, mt: 0.5 }}
                onClick={() => handleExtendBtn()}
              >
                {t("extend")}
              </Button>
            )}
            {props.isDownloadBtn && (
              <Button
                variant="contained"
                color="secondary"
                sx={{ ml: "10px", mb: 1.5, mt: 0.5 }}
                onClick={() => props.handleDownloadBtn()}
              >
                {t("download")}
              </Button>
            )}
          </Box>
        )}
        {props.footerMessage && (
          <>
            <Box sx={{ mx: 1.5, color: "text.primary" }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>
            <Box sx={{ m: "15px" }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 1, px: 3 }}
                type="button"
                onClick={() => {
                  props.declineDoc(reason);
                  setReason("");
                }}
              >
                {t("yes")}
              </Button>
              <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={() => {
                  setReason("");
                  props.setIsDecline({ isDeclined: false });
                }}
              >
                {t("close")}
              </Button>
            </Box>
          </>
        )}
        {isExtendExpiry && (
          <Box component="form" sx={{ mx: 1.5, mb: 1.5 }} onSubmit={handleUpdateExpiry}>
            <Typography
              component="label"
              htmlFor="expiryDate"
              sx={{ display: "block", ml: 1, mt: 1, color: "text.primary" }}
            >
              {t("expiry-date")} {"(dd-mm-yyyy)"}
            </Typography>
            <TextField
              fullWidth
              id="expiryDate"
              type="date"
              onClick={(e) => e?.currentTarget?.querySelector?.("input")?.showPicker?.()}
              defaultValue={props?.doc?.ExpiryDate?.iso?.split("T")?.[0]}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", mt: 1 }}>
              <Button type="submit" variant="contained" color="primary" sx={{ mr: 1 }}>
                {t("update")}
              </Button>
              <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={() => {
                  setExpiryDate("");
                  setIsExtendExpiry(false);
                }}
              >
                {t("cancel")}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    )
  );
}

export default CustomModal;
