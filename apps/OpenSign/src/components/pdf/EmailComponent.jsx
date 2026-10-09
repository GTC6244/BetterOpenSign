import { useState } from "react";
import {
  handleToPrint,
} from "../../constant/Utils";
import {
  emailRegex,
} from "../../constant/const";
import Loader from "../../primitives/Loader";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import Parse from "parse";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

function EmailComponent({
  isEmail,
  setIsEmail,
  setSuccessEmail,
  pdfDetails,
  setIsAlert,
  setIsDownloadModal
}) {
  const { t } = useTranslation();
  const [emailList, setEmailList] = useState([]);
  const [emailValue, setEmailValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [isDownloading, setIsDownloading] = useState("");
  const isAndroid = /Android/i.test(navigator.userAgent);

  //function for send email
  const sendEmail = async () => {
    setIsLoading(true);
    const params = { docId: pdfDetails?.[0]?.objectId, recipients: emailList };
    const sendmail = await Parse.Cloud.run("forwarddoc", params);
    if (sendmail?.status === "success") {
      setSuccessEmail(true);
      setIsEmail(false);
      setTimeout(() => {
        setSuccessEmail(false);
        setEmailValue("");
        setEmailList([]);
      }, 1500);
      setIsLoading(false);
    }
    else {
      setIsLoading(false);
      setIsEmail(false);
      setIsAlert({
        isShow: true,
        alertMessage: t("something-went-wrong-mssg")
      });
      setEmailValue("");
      setEmailList([]);
    }
  };

  //function for remove email
  const removeChip = (index) => {
    const updateEmailCount = emailList.filter((data, key) => key !== index);
    setEmailList(updateEmailCount);
  };
  //function for get email value
  const handleEmailValue = (e) => {
    const value = e.target.value?.toLowerCase()?.replace(/\s/g, "");
    setEmailErr(false);
    setEmailValue(value);
  };

  //function for save email in array after press enter
  const handleEnterPress = (e) => {
    const pattern = emailRegex;
    const validate = emailValue?.match(pattern);
    if (e.key === "Enter" && emailValue) {
      if (validate) {
        const emailLowerCase = emailValue?.toLowerCase();
        setEmailList((prev) => [...prev, emailLowerCase]);
        setEmailValue("");
      } else {
        setEmailErr(true);
      }
    } else if (e === "add" && emailValue) {
      if (validate) {
        const emailLowerCase = emailValue?.toLowerCase();
        setEmailList((prev) => [...prev, emailLowerCase]);
        setEmailValue("");
      } else {
        setEmailErr(true);
      }
    }
  };
  const handleClose = () => {
    setIsEmail(false);
    setEmailValue("");
    setEmailList([]);
  };
  return (
    <div>
      {/* isEmail */}
      {isEmail && (
        <ModalUi isOpen showHeader={false}>
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 20,
                bgcolor: "rgba(230,242,242,0.7)"
              }}
            >
              <Loader />
              <Box component="span" sx={{ fontSize: "0.75rem", color: "text.primary" }}>
                {t("loader")}
              </Box>
            </Box>
          )}
          {isDownloading === "pdf" && (
            <Box
              sx={{
                position: "fixed",
                zIndex: 200,
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "rgba(0,0,0,0.3)"
              }}
            >
              <Loader />
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.25,
              px: 2.5,
              borderBottom: "1px solid",
              borderColor: "text.primary"
            }}
          >
            <Box
              component="span"
              sx={{
                color: "text.primary",
                fontWeight: 700,
                fontSize: { xs: "0.875rem", md: "1.125rem" }
              }}
            >
              {t("successfully-signed")}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              {!isAndroid && (
                <Button
                  size="small"
                  variant="contained"
                  color="inherit"
                  startIcon={
                    <i className="fa-light fa-print" aria-hidden="true"></i>
                  }
                  onClick={(e) =>
                    handleToPrint(e, setIsDownloading, pdfDetails)
                  }
                  sx={{ fontSize: { xs: "0.75rem", md: "15px" } }}
                >
                  {t("print")}
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                startIcon={
                  <i className="fa-light fa-download" aria-hidden="true"></i>
                }
                onClick={() => {
                  handleClose();
                  setIsDownloadModal(true);
                }}
                sx={{ fontSize: { xs: "0.75rem", md: "15px" }, ml: 1 }}
              >
                {t("download")}
              </Button>
            </Box>
          </Box>
          <Box sx={{ height: "100%", p: 2.5 }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "15px",
                mb: 0.625,
                color: "text.primary",
                verticalAlign: "baseline"
              }}
            >
              {t("email-mssg")}
            </Typography>
            {emailList.length > 0 ? (
              <Box
                sx={{
                  p: 0,
                  border: "1px solid",
                  borderColor: "primary.main",
                  width: "100%",
                  borderRadius: 1,
                  fontSize: "15px",
                  overflow: "hidden"
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                  {emailList.map((data, ind) => {
                    return (
                      <Chip
                        key={ind}
                        label={data}
                        onDelete={() => removeChip(ind)}
                        color="primary"
                        size="small"
                        sx={{ mx: "2px", mt: "2px", borderRadius: 1 }}
                      />
                    );
                  })}
                </Box>
                {emailList.length <= 9 && (
                  <Box
                    component="input"
                    type="email"
                    value={emailValue}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      width: "100%",
                      fontSize: "15px",
                      bgcolor: "transparent",
                      outline: "none",
                      border: "none",
                      color: "text.primary"
                    }}
                    onChange={handleEmailValue}
                    onKeyDown={handleEnterPress}
                    onBlur={() => emailValue && handleEnterPress("add")}
                    onInvalid={(e) =>
                      e.target.setCustomValidity(t("input-required"))
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                  />
                )}
              </Box>
            ) : (
              <div>
                <Box
                  component="input"
                  type="email"
                  value={emailValue}
                  sx={{
                    p: 1.25,
                    pb: 2.5,
                    color: "text.primary",
                    borderRadius: 1,
                    width: "100%",
                    fontSize: "15px",
                    outline: "none",
                    bgcolor: "transparent",
                    border: "1px solid",
                    borderColor: "primary.main"
                  }}
                  onChange={handleEmailValue}
                  onKeyDown={handleEnterPress}
                  placeholder={t("enter-email-placeholder")}
                  onBlur={() => emailValue && handleEnterPress("add")}
                  onInvalid={(e) =>
                    e.target.setCustomValidity(t("input-required"))
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  required
                />
              </div>
            )}
            {emailErr && (
              <Typography sx={{ fontSize: "0.75rem", color: "error.main", ml: 0.75, mt: 0.25 }}>
                {t("email-error-1")}
              </Typography>
            )}
            <Box sx={{ mt: 1 }}>
              <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={() => emailList.length > 0 && sendEmail()}
              >
                {t("send")}
              </Button>
              <Button
                type="button"
                variant="text"
                color="inherit"
                sx={{ ml: 1 }}
                onClick={() => handleClose()}
              >
                {t("close")}
              </Button>
            </Box>
          </Box>
        </ModalUi>
      )}
    </div>
  );
}

export default EmailComponent;
