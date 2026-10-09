import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Parse from "parse";
import Tooltip from "../../primitives/Tooltip";
import Alert from "../../primitives/Alert";
import Loader from "../../primitives/Loader";
import { withSessionValidation } from "../../utils";
import { useDispatch } from "react-redux";
import { setTenantInfo, setUserInfo } from "../../redux/reducers/userReducer";
import EmailEditor from "../emaileditor";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const MailTemplateEditor = ({
  info,
  tenantId,
}) => {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [requestBody, setRequestBody] = useState({ basic: "", advanced: "" });
  const [requestSubject, setRequestSubject] = useState("");
  const [completionBody, setCompletionBody] = useState({
    basic: "",
    advanced: ""
  });
  const [completionSubject, setCompletionSubject] = useState("");
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);
  const [isDefaultMail, setIsDefaultMail] = useState({
    requestMail: false,
    completionMail: false
  });
  const [isMailLoader, setIsMailLoader] = useState({
    request: false,
    completion: false
  });
  const [isalert, setIsAlert] = useState({ type: "success", msg: "" });
  const [editorType, setEditorType] = useState({
    request: "basic",
    completion: "basic"
  });
  const defaultRequestSubject = `{{sender_name}} has requested you to sign {{document_title}}`;
  const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process, please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
  const defaultCompletionSubject = `Document {{document_title}} has been signed by all parties`;
  const defaultCompletionBody = `<p>Hi {{sender_name}},</p><br><p>All parties have successfully signed the document {{document_title}}. Kindly download the document from the attachment.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
  const cloudfunction =
        "updatetenant";

  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    info
  ]);

  const handleModifyMail = (mode) => {
    mode === "request"
      ? setIsDefaultMail((p) => ({ ...p, requestMail: !p?.requestMail }))
      : setIsDefaultMail((p) => ({ ...p, completionMail: !p?.completionMail }));
  };
  const fetchSubscription = async () => {
      await tenantEmailTemplate(info);
  };

  const tenantEmailTemplate = async (tenantRes) => {
    if (tenantRes === "user does not exist!") {
      alert(t("user-not-exist"));
    } else if (tenantRes) {
      const updateRes = tenantRes;
      const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process, please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
      if (updateRes?.RequestBody) {
        setRequestBody((p) => ({
          ...p,
          basic: updateRes?.RequestBody,
          advanced: updateRes?.RequestBody
        }));
        setRequestSubject(updateRes?.RequestSubject);
        setIsDefaultMail((prev) => ({ ...prev, requestMail: false }));
      } else {
        setRequestBody((p) => ({
          ...p,
          basic: defaultRequestBody,
          advanced: defaultRequestBody
        }));
        setRequestSubject(defaultRequestSubject);
        setIsDefaultMail((prev) => ({ ...prev, requestMail: true }));
      }
      if (updateRes?.CompletionBody) {
        setCompletionBody((p) => ({
          ...p,
          basic: updateRes?.CompletionBody,
          advanced: updateRes?.CompletionBody
        }));
        setCompletionSubject(updateRes?.CompletionSubject);
        setIsDefaultMail((prev) => ({ ...prev, completionMail: false }));
      } else {
        setCompletionBody((p) => ({
          ...p,
          basic: defaultCompletionBody,
          advanced: defaultCompletionBody
        }));
        setCompletionSubject(defaultCompletionSubject);
        setIsDefaultMail((prev) => ({ ...prev, completionMail: true }));
      }
      setEditorType((p) => ({
        ...p,
        request: updateRes?.EmailEditorType?.request || "basic",
        completion: updateRes?.EmailEditorType?.completion || "basic"
      }));
      setIsTemplateLoaded((prev) => !prev);
    }
  };

  const updateValuesInRedux = (subject, body, response) => {
    const action =
          setTenantInfo;
    const updatedInfo = { ...info };
    updatedInfo[subject] = response?.[subject] ?? "";
    updatedInfo[body] = response?.[body] ?? "";
    updatedInfo.EmailEditorType = response?.EmailEditorType;
    dispatch(action(updatedInfo));
  };
  //function to save completion email template
  const handleSaveCompletionEmail = withSessionValidation(async (e) => {
    e.preventDefault();
    try {
      const replacedHtmlBody = completionBody[editorType.completion]?.replace(
        /"/g,
        "'"
      );
      const htmlBody = `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>${replacedHtmlBody}</body></html>`;
      const updateTenant = await Parse.Cloud.run(cloudfunction, {
        tenantId: tenantId,
        details: {
          CompletionBody: htmlBody,
          CompletionSubject: completionSubject,
          EmailEditorType: editorType
        }
      });
      if (updateTenant) {
        const updateRes = JSON.parse(JSON.stringify(updateTenant));
        setCompletionBody((p) => ({
          ...p,
          basic: updateRes?.CompletionBody,
          advanced: updateRes?.CompletionBody
        }));
        setCompletionSubject(updateRes?.CompletionSubject);
        setEditorType(updateRes?.EmailEditorType);
        updateValuesInRedux("CompletionSubject", "CompletionBody", updateRes);
        setIsAlert({ type: "success", msg: t("saved-successfully") });
        setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
      }
    } catch (err) {
      console.error("Error while saving completion email template: ", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
      setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
    }
  });
  //function to save request email template
  const handleSaveRequestEmail = withSessionValidation(async (e) => {
    e.preventDefault();
    try {
      const replacedHtmlBody = requestBody[editorType.request]?.replace(
        /"/g,
        "'"
      );

      const htmlBody = `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>${replacedHtmlBody}</body></html>`;
      const updateTenant = await Parse.Cloud.run(cloudfunction, {
        tenantId: tenantId,
        details: {
          RequestBody: htmlBody,
          RequestSubject: requestSubject,
          EmailEditorType: editorType
        }
      });
      if (updateTenant) {
        const updateRes = JSON.parse(JSON.stringify(updateTenant));
        setRequestBody((p) => ({
          ...p,
          basic: updateRes?.RequestBody,
          advanced: updateRes?.RequestBody
        }));
        setRequestSubject(updateRes?.RequestSubject);
        setEditorType(updateRes?.EmailEditorType);
        let extUser =
          localStorage.getItem("Extand_Class") &&
          JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
        if (extUser && extUser?.objectId) {
            extUser.TenantId.RequestBody = updateRes?.RequestBody;
            extUser.TenantId.RequestSubject = updateRes?.RequestSubject;
            extUser.TenantId.EmailEditorType = updateRes?.EmailEditorType;
          const _extUser = JSON.parse(JSON.stringify(extUser));
          localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
        }
        updateValuesInRedux("RequestSubject", "RequestBody", updateRes);
        setIsAlert({ type: "success", msg: t("saved-successfully") });
        setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
      }
    } catch (err) {
      console.error("Error while saving request email template: ", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
      setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
    }
  });

  //function to use reset form
  const handleReset = withSessionValidation(async (request, completion) => {
    let extUser =
      localStorage.getItem("Extand_Class") &&
      JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
    handleModifyMail(request);
    if (request && !isDefaultMail?.requestMail) {
      const emailEditor = {
        request: "basic",
        completion: editorType.completion
      };
      setRequestBody((p) => ({
        ...p,
        basic: defaultRequestBody,
        advanced: defaultRequestBody
      }));
      setEditorType((p) => ({ ...p, request: "basic" }));
      setRequestSubject(defaultRequestSubject);
      setIsMailLoader((p) => ({ ...p, request: true }));
      try {
        await Parse.Cloud.run(cloudfunction, {
          tenantId: tenantId,
          details: {
            RequestBody: "",
            RequestSubject: "",
            EmailEditorType: emailEditor
          }
        });

        if (extUser && extUser?.objectId) {
            extUser.TenantId.RequestBody = "";
            extUser.TenantId.RequestSubject = "";
            extUser.TenantId.EmailEditorType = emailEditor;
          const _extUser = JSON.parse(JSON.stringify(extUser));
          localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
          dispatch(
            setUserInfo({
              ...info,
              RequestSubject: "",
              RequestBody: "",
              EmailEditorType: emailEditor
            })
          );
        }
      } catch (err) {
        console.error("Error while resetting request mail: ", err);
      } finally {
        setIsMailLoader((p) => ({ ...p, request: false }));
      }
    } else if (completion && !isDefaultMail?.completionMail) {
      const emailEditor = { request: editorType.request, completion: "basic" };
      setCompletionSubject(defaultCompletionSubject);
      setCompletionBody((p) => ({
        ...p,
        basic: defaultCompletionBody,
        advanced: defaultCompletionBody
      }));
      setEditorType((p) => ({ ...p, completion: "basic" }));
      setIsMailLoader((p) => ({ ...p, completion: true }));
      try {
        await Parse.Cloud.run(cloudfunction, {
          tenantId: tenantId,
          details: {
            CompletionBody: "",
            CompletionSubject: "",
            EmailEditorType: emailEditor
          }
        });
        if (extUser && extUser?.objectId) {
            extUser.TenantId.CompletionBody = "";
            extUser.TenantId.CompletionSubject = "";
            extUser.TenantId.EmailEditorType = emailEditor;
          const _extUser = JSON.parse(JSON.stringify(extUser));
          localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
          dispatch(
            setUserInfo({
              ...info,
              CompletionSubject: "",
              CompletionBody: "",
              EmailEditorType: emailEditor
            })
          );
        }
      } catch (err) {
        console.error("Error while resetting completion mail: ", err);
      } finally {
        setIsMailLoader((p) => ({ ...p, completion: false }));
      }
    }
  });
  //function for handle ontext change and save again text in delta
  const handleOnchangeRequest = (newValue, changedType) => {
    setRequestBody((prev) => ({ ...prev, [changedType]: newValue }));
  };

  const handleOnchangeCompletion = (newValue, changedType) => {
    setCompletionBody((prev) => ({ ...prev, [changedType]: newValue }));
  };

  const handleSwitch = (e, flow) => {
    e.preventDefault();
    e.stopPropagation();
    const editor = editorType[flow] === "basic" ? "advanced" : "basic";
    setEditorType((p) => ({ ...p, [flow]: editor }));
  };

  return (
    <>
      {isalert.msg && <Alert type={isalert.type}>{isalert.msg}</Alert>}
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            component="h1"
            sx={{ fontSize: 14, mb: "0.7rem", fontWeight: 500 }}
          >
            {t("request-email")}
          </Typography>
          <Box sx={{ position: "relative", mt: 1, mb: 2 }}>
            {isMailLoader.request && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.3)"
                }}
              >
                <Loader />
              </Box>
            )}
            {isDefaultMail?.requestMail && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(2px)",
                  bgcolor: "rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  userSelect: "none"
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => handleModifyMail("request")}
                  sx={{ boxShadow: 3 }}
                >
                  {t("modify")}
                </Button>
              </Box>
            )}
            <Box
              component="form"
              onSubmit={handleSaveRequestEmail}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: "outline.main",
                borderRadius: 2
              }}
            >
              <Box>
                <Box component="label" sx={{ fontSize: 14 }}>
                  {t("subject")}{" "}
                  <Tooltip
                    id={"request-sub-tooltip"}
                    message={`${t("variables-use")}: {{document_title}} {{sender_name}}, {{sender_mail}}, {{sender_phone}}, {{receiver_name}}, {{receiver_email}}, {{receiver_phone}}, {{expiry_date}}, {{company_name}}, {{signing_url}}, {{note}}`}
                  />
                </Box>
                <TextField
                  required
                  fullWidth
                  size="small"
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  placeholder={`{{sender_name}} ${t("send-to-sign")} {{document_title}}`}
                  sx={{ mt: 0.5, "& .MuiInputBase-input": { fontSize: 12 } }}
                />
              </Box>
              <Box sx={{ py: 1 }}>
                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 14,
                    mt: 1.5
                  }}
                >
                  <span>
                    {t("body")}{" "}
                    <Tooltip
                      id={"request-body-tooltip"}
                      message={`${t("variables-use")}: {{document_title}} {{sender_name}}, {{sender_mail}}, {{sender_phone}}, {{receiver_name}}, {{receiver_email}}, {{receiver_phone}}, {{expiry_date}}, {{company_name}}, {{signing_url}}, {{note}}`}
                    />
                  </span>
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={(e) => handleSwitch(e, "request")}
                    sx={{ fontSize: 14 }}
                  >
                    {editorType.request === "basic"
                      ? t("switch-to-advanced")
                      : t("switch-to-basic")}
                  </Link>
                </Box>
                <EmailEditor
                  type={editorType.request}
                  values={requestBody}
                  onChange={handleOnchangeRequest}
                  bodyName="request"
                  isReset={isMailLoader?.request}
                  isTemplateLoaded={isTemplateLoaded}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
                <Button
                  disabled={!requestBody[editorType.request] || !requestSubject}
                  variant="contained"
                  type="submit"
                >
                  {t("save")}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleReset("request")}
                >
                  {t("reset")}
                </Button>
              </Box>
            </Box>
          </Box>
          <Typography
            component="h1"
            sx={{ fontSize: 14, mb: "0.7rem", fontWeight: 500 }}
          >
            {t("completion-email")}
          </Typography>
          <Box sx={{ position: "relative", my: 1 }}>
            {isMailLoader.completion && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.3)"
                }}
              >
                <Loader />
              </Box>
            )}
            {isDefaultMail?.completionMail && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(2px)",
                  bgcolor: "rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  userSelect: "none"
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => handleModifyMail("completion")}
                  sx={{ boxShadow: 3 }}
                >
                  {t("modify")}
                </Button>
              </Box>
            )}
            <Box
              component="form"
              onSubmit={handleSaveCompletionEmail}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: "outline.main",
                borderRadius: 2
              }}
            >
              <Box>
                <Box component="label" sx={{ fontSize: 14 }}>
                  {t("subject")}{" "}
                  <Tooltip
                    id={"complete-sub-tooltip"}
                    message={`${t("variables-use")}: {{document_title}} {{sender_name}}, {{sender_mail}}, {{sender_phone}}, {{receiver_name}}, {{receiver_email}}, {{receiver_phone}}, {{company_name}}, {{signing_url}}, {{note}}`}
                  />
                </Box>
                <TextField
                  required
                  fullWidth
                  size="small"
                  value={completionSubject}
                  onChange={(e) => setCompletionSubject(e.target.value)}
                  placeholder={`{{sender_name}}  ${t("send-to-sign")} {{document_title}}`}
                  sx={{ mt: 0.5, "& .MuiInputBase-input": { fontSize: 12 } }}
                />
              </Box>
              <Box sx={{ py: 1 }}>
                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 14,
                    mt: 1.5
                  }}
                >
                  <span>
                    {t("body")}{" "}
                    <Tooltip
                      id={"complete-body-tooltip"}
                      message={`${t("variables-use")}: {{document_title}} {{sender_name}}, {{sender_mail}}, {{sender_phone}}, {{receiver_name}}, {{receiver_email}}, {{receiver_phone}}, {{company_name}}, {{signing_url}}, {{note}}`}
                    />
                  </span>
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={(e) => handleSwitch(e, "completion")}
                    sx={{ fontSize: 14 }}
                  >
                    {editorType.completion === "basic"
                      ? t("switch-to-advanced")
                      : t("switch-to-basic")}
                  </Link>
                </Box>
                <EmailEditor
                  type={editorType.completion}
                  values={completionBody}
                  onChange={handleOnchangeCompletion}
                  bodyName="completion"
                  isReset={isMailLoader?.completion}
                  isTemplateLoaded={isTemplateLoaded}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
                <Button
                  disabled={
                    !completionBody[editorType.completion] || !completionSubject
                  }
                  variant="contained"
                  type="submit"
                >
                  {t("save")}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleReset(null, "completion")}
                >
                  {t("reset")}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default MailTemplateEditor;
