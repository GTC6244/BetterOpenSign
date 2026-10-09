import { useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { EmailBody } from "./EmailBody";
import {
  contractDocument,
  defaultMailBody,
  defaultMailSubject,
  sendEmailToSigners
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import Loader from "../../primitives/Loader";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

const statusMap = {
  success: "success",
  "quota-reached": "quotareached",
};
function CustomizeMail(props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCustomize, setIsCustomize] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isLoader, setIsLoader] = useState(false);

  const handleCloseSendmailModal = () => {
    if (props?.handleClose) {
      props?.handleClose();
      return;
    }
    props?.setIsMailModal(false);
    navigate("/report/1MwEuxLEkF");
  };

  const handleEmailSendToSigners = async () => {
    setIsLoader(true);
    const documentData = await contractDocument(props?.documentId);
    if (documentData && documentData?.length > 0) {
      props?.setDocumentDetails && props?.setDocumentDetails(documentData[0]);
      if (
        documentData?.[0]?.SendinOrder &&
        documentData?.[0]?.SendinOrder === true
      ) {
        const ownerEmail = documentData[0].ExtUserPtr.Email;
        const ownerDetails = documentData[0].Signers.find(
          (x) => x.Email === ownerEmail
        );
        props?.setCurrUserId && props?.setCurrUserId(ownerDetails?.objectId);
      }
      const customMail = {
        body:
          props?.emailEditorType === "basic"
            ? props?.customizeMail?.body?.basic
            : props?.customizeMail?.body?.advanced,
        subject: props?.customizeMail?.subject
      };
      //function is used to send email to signers for sign the document
      const mailRes = await sendEmailToSigners(
        documentData,
        props?.signerList,
        customMail,
        props?.defaultMail,
        isCustomize,
      );
      props?.setIsMailModal(false);
      props?.setIsSend(true);
      setIsLoader(false);
      props?.setMailStatus(statusMap[mailRes?.status] ?? "failed");
    } else {
      alert("something-went-wrong-mssg");
    }
  };

  const handleReset = () => {
    setIsReset(true);
    props?.setCustomizeMail({
      subject: defaultMailSubject,
      body: { basic: defaultMailBody, advanced: defaultMailBody }
    });
  };
  const onChangeSubject = (value) => {
    setIsReset(false);
    props?.setCustomizeMail((prev) => ({ ...prev, subject: value }));
  };

  const onChangeBody = (newValue, changedType) => {
    setIsReset(false);
    props?.setCustomizeMail((prev) => ({
      ...prev,
      body: { ...prev.body, [changedType]: newValue }
    }));
  };
  const handleSwitch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const editor = props?.emailEditorType === "basic" ? "advanced" : "basic";
    props.setEmailEditorType(editor);
  };

  return (
    <>
      {isLoader ? (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            borderRadius: 2,
            zIndex: 30
          }}
        >
          <Loader />
        </Box>
      ) : (
        <ModalUi
          isOpen={props?.isMailModal}
          title={t("send-mail")}
          handleClose={() => handleCloseSendmailModal()}
        >
          <Box
            className="scroll-hide"
            sx={{
              maxHeight: "24rem",
              overflowY: "scroll",
              p: 2.5,
              color: "text.primary"
            }}
          >
            {!isCustomize && <span>{t("placeholder-alert-3")}</span>}
            {
                isCustomize && (
                  <>
                    <EmailBody
                      requestBody={props?.customizeMail?.body}
                      requestSubject={props?.customizeMail?.subject}
                      onChangeBody={onChangeBody}
                      onChangeSubject={onChangeSubject}
                      isReset={isReset}
                      handleSwitch={handleSwitch}
                      emailEditorType={props.emailEditorType}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 1,
                        cursor: "pointer"
                      }}
                      onClick={() => handleReset()}
                    >
                      <Link component="span" underline="hover">
                        {t("reset-to-default")}
                      </Link>
                    </Box>
                  </>
                )
            }
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: { xs: 1, md: 3 },
                mt: 1
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                <Button
                  onClick={() => handleEmailSendToSigners()}
                  variant="contained"
                  sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                >
                  {t("send")}
                </Button>
                {isCustomize && (
                  <Button
                    onClick={() => setIsCustomize(false)}
                    variant="text"
                    color="inherit"
                    sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    {t("close")}
                  </Button>
                )}
              </Box>
              {
                  !isCustomize && (
                    <Link
                      component="span"
                      underline="hover"
                      color="secondary"
                      sx={{ fontSize: "0.875rem", cursor: "pointer" }}
                      onClick={() => setIsCustomize(true)}
                    >
                      {t("customize-email")}
                    </Link>
                  )
              }
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 1.5
              }}
            >
              <Box sx={{ height: "1px", width: "20%", bgcolor: "outline.variant" }} />
              <Box component="span" sx={{ mx: 0.625 }}>
                {t("or")}
              </Box>
              <Box sx={{ height: "1px", width: "20%", bgcolor: "outline.variant" }} />
            </Box>
            <Box sx={{ my: 1.5 }}>{props?.handleShareList()}</Box>
            <p id="copyUrl" ref={props?.copyUrlRef} className="hidden"></p>
          </Box>
        </ModalUi>
      )}
    </>
  );
}

export default CustomizeMail;
