import {
  useState,
  useRef,
} from "react";
import {
  base64ToArrayBuffer,
  convertBase64ToFile,
  generatePdfName,
  getFileName
} from "../../constant/Utils";
import {
  maxDescriptionLength,
  maxNoteLength,
  maxTitleLength
} from "../../constant/const";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import SignersInput from "../shared/fields/SignersInput";
import { PDFDocument } from "pdf-lib";
import ModalUi from "../../primitives/ModalUi";
import { SaveFileSize } from "../../constant/saveFileSize";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const EditTemplate = ({
  title,
  handleClose,
  pdfbase64,
  template,
  onSuccess,
  setPdfArrayBuffer,
  setPdfBase64Url,
  isAddYourSelfCheckbox,
}) => {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const inputFileRef = useRef(null);
  const [formData, setFormData] = useState({
    Name: template?.Name || "",
    Note: template?.Note || "",
    Description: template?.Description || "",
    SendinOrder: template?.SendinOrder ? `${template?.SendinOrder}` : "false",
    SendInOrderStrict:
      template?.SendInOrderStrict === true ? "true" : "false",
    AutomaticReminders: template?.AutomaticReminders || false,
    RemindOnceInEvery: template?.RemindOnceInEvery || 5,
    IsEnableOTP: template?.IsEnableOTP ? `${template?.IsEnableOTP}` : "false",
    IsTourEnabled: template?.IsTourEnabled
      ? `${template?.IsTourEnabled}`
      : "false",
    NotifyOnSignatures:
      template?.NotifyOnSignatures !== undefined
        ? template?.NotifyOnSignatures
        : false,
    Bcc: template?.Bcc,
    Cc: template?.Cc,
    RedirectUrl: template?.RedirectUrl || "",
    AllowModifications: template?.AllowModifications || false,
    TimeToCompleteDays: template?.TimeToCompleteDays || 15,
  });
  const pensList = ["blue", "red", "black"];
  const [selectedColors, setSelectedColors] = useState(
    template?.PenColors || pensList
  );
  const [isUpdate, setIsUpdate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadPdf, setUploadPdf] = useState({
    name: "",
    base64: "",
    url: ""
  });
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type === "application/pdf") {
      handleReplaceFileValdition(file);
      // You can handle the file here
    } else {
      alert(t("only-pdf-allowed"));
      if (inputFileRef.current) inputFileRef.current.value = "";
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // `isValidURL` is used to check valid webhook url
  function isValidURL(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (error) {
      return false;
    }
  }

  const handleStrInput = (e) => {
    setIsUpdate(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const getPdfMetadataHash = async (pdfBytes) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const metaString = pages
      .map((page, index) => {
        const { width, height } = page.getSize();
        return `${index + 1}:${Math.round(width)}x${Math.round(height)}`;
      })
      .join("|");
    const encoder = new TextEncoder();
    const data = encoder.encode(metaString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleReplaceFileValdition(file);
  };
  const handleReplaceFileValdition = async (file) => {
    try {
      const basePdfBytes = base64ToArrayBuffer(pdfbase64);
      const expectedHash = await getPdfMetadataHash(basePdfBytes);
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const uploadedPdfBytes = event.target.result;
        const uploadedHash = await getPdfMetadataHash(uploadedPdfBytes);

        if (expectedHash === uploadedHash) {
          const arrayBuffer = uploadedPdfBytes;
          const uint8Array = new Uint8Array(arrayBuffer);
          const binaryString = Array.from(uint8Array)
            .map((b) => String.fromCharCode(b))
            .join("");
          const base64 = btoa(binaryString);
          const pdfName = generatePdfName(16);
          setIsUpdate(true);
          setUploadPdf((prev) => ({ ...prev, name: pdfName, base64: base64 }));
          // alert("✅ PDFs match (based on page number, width, height)");
        } else {
          alert("❌ PDF do NOT match based on page number, width, height");
          if (inputFileRef.current) inputFileRef.current.value = "";
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      alert("Error: " + err.message);
      if (inputFileRef.current) inputFileRef.current.value = "";
    }
  };
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (formData.RedirectUrl && !isValidURL(formData?.RedirectUrl)) {
      alert(t("invalid-redirect-url"));
      return;
    }
    if (formData?.Name?.length > maxTitleLength) {
      alert(t("title-length-alert"));
      return;
    }
    if (formData?.Note?.length > maxNoteLength) {
      alert(t("note-length-alert"));
      return;
    }
    if (formData?.Description?.length > maxDescriptionLength) {
      alert(t("description-length-alert"));
      return;
    }
    let pdfUrl;
    if (uploadPdf?.base64) {
      pdfUrl = await convertBase64ToFile(
        uploadPdf.name,
        uploadPdf.base64,
      );
      setUploadPdf((prev) => ({ ...prev, url: pdfUrl }));
      const pdfBuffer = base64ToArrayBuffer(uploadPdf.base64);
      setPdfArrayBuffer && setPdfArrayBuffer(pdfBuffer);
      setPdfBase64Url && setPdfBase64Url(uploadPdf.base64);
      const tenantId =
        localStorage.getItem("TenantId") ||
        template?.ExtUserPtr?.TenantId?.objectId;
      const buffer = atob(uploadPdf.base64);
      const userId = template?.ExtUserPtr?.UserId?.objectId;
      SaveFileSize(buffer.length, pdfUrl, tenantId, userId);
    }
    const isChecked = formData.SendinOrder === "true" ? true : false;
    const isStrictOrder =
      isChecked && formData.SendInOrderStrict === "true";
    const isTourEnabled = formData?.IsTourEnabled === "false" ? false : true;
    const AutoReminder = formData?.AutomaticReminders || false;
    const IsEnableOTP = formData.IsEnableOTP === "true" ? true : false;
    const allowModify = formData?.AllowModifications || false;
    let reminderDate = {};
    const remindOnceInEvery = formData?.RemindOnceInEvery;
    const TimeToCompleteDays = parseInt(formData?.TimeToCompleteDays);
    const reminderCount = TimeToCompleteDays / remindOnceInEvery;
    if (AutoReminder && reminderCount > 15) {
      alert(t("only-15-reminder-allowed"));
      return;
    }
    if (AutoReminder) {
      const RemindOnceInEvery = parseInt(formData?.RemindOnceInEvery);
      const ReminderDate = new Date(template?.createdAt);
      ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
      reminderDate = { NextReminderDate: ReminderDate };
    }
    const data = {
      ...formData,
      ...(pdfUrl ? { URL: pdfUrl } : {}),
      SendinOrder: isChecked,
      SendInOrderStrict: isStrictOrder,
      IsEnableOTP: IsEnableOTP,
      IsTourEnabled: isTourEnabled,
      AllowModifications: allowModify,
      PenColors: selectedColors,
      ...reminderDate
    };
    onSuccess(data);
  };

  // `handleNotifySignChange` is trigger when user change radio of notify on signatures
  const handleNotifySignChange = (value) => {
    setIsUpdate(true);
    setFormData((obj) => ({ ...obj, NotifyOnSignatures: value }));
  };
  const handleBcc = (data) => {
    if (data && data.length > 0) {
      const trimEmail = data.map((item) => ({
        objectId: item?.value,
        Name: item?.label,
        Email: item?.email
      }));
      setIsUpdate(true);
      setFormData((prev) => ({ ...prev, Bcc: trimEmail }));
    }
  };

  const handleCc = (data) => {
    if (data && data.length > 0) {
      const trimEmail = data.map((item) => ({
        objectId: item?.value,
        Name: item?.label,
        Email: item?.email
      }));
      setIsUpdate(true);
      setFormData((prev) => ({ ...prev, Cc: trimEmail }));
    }
  };

  const handleEditTemplateClose = () => {
    if (isUpdate) {
      setShowConfirm(true);
    } else {
      handleClose();
    }
  };
  const discardChanges = () => {
    setShowConfirm(false);
    handleClose();
  };

  const handleColorsChange = (color) => {
    setSelectedColors((prev) => {
      // If user tries to uncheck the last remaining color → block it
      if (prev.length === 1 && prev.includes(color)) {
        return prev;
      }

      // Normal toggle behavior
      return prev.includes(color)
        ? prev.filter((c) => c !== color) // remove
        : [...prev, color]; // add
    });
  };

  const reminderCustomWarning = (e) => {
    if (!formData.RemindOnceInEvery || formData.RemindOnceInEvery === 0) {
      return e.target.setCustomValidity(t("input-required"));
    } else {
      return e.target.setCustomValidity(t("reminder-error"));
    }
  };
  return (
    <ModalUi
      isOpen
      title={isUpdate ? `${title} (unsaved)` : title}
      handleClose={handleEditTemplateClose}
    >
      <ModalUi isOpen={showConfirm} showClose={false}>
        <Box sx={{ p: 2.5 }}>
          <Box
            component="p"
            sx={{
              fontSize: "1rem",
              fontWeight: 400,
              color: "text.primary",
              py: { xs: "5px", md: "6px" },
              px: "5px"
            }}
          >
            {t("unsaved-changes-discard-them?")}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 1.25,
              gap: { xs: 1, md: 1.5 }
            }}
          >
            <Button
              variant="contained"
              sx={{ px: 3 }}
              onClick={discardChanges}
            >
              {t("yes-discard")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              sx={{ px: { xs: 2, md: 3 } }}
              onClick={() => setShowConfirm(false)}
            >
              {t("cancel")}
            </Button>
          </Box>
        </Box>
      </ModalUi>
      <div className="max-h-[300px] md:max-h-[400px] overflow-y-scroll p-[10px]">
        <Box sx={{ color: "text.primary" }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-[0.35rem]">
              <label htmlFor="name" className="text-[13px]">
                {t("report-heading.File")}
              </label>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => inputFileRef?.current?.click()}
                sx={{
                  border: "1.5px dashed",
                  borderColor: "outline.variant",
                  borderRadius: 2,
                  px: 2,
                  py: 3,
                  textAlign: "center",
                  color: "text.secondary",
                  bgcolor: "background.paper",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "text.primary" }
                }}
              >
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer text-center mb-0"
                >
                  {t("browse-or-drag-to-replace-existing-file")}
                </label>
              </Box>
              <input
                ref={inputFileRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => handleFileInput(e)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
              {uploadPdf?.name && (
                <Box
                  onClick={() => inputFileRef?.current?.click()}
                  sx={{
                    mt: 1,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "outline.main",
                    borderRadius: 1,
                    py: 1,
                    px: 1.5,
                    fontWeight: 600,
                    width: "100%",
                    fontSize: "0.75rem"
                  }}
                >
                  selected:{" "}
                  {uploadPdf?.url
                    ? `${uploadPdf?.name}.pdf`
                    : getFileName(template.URL)}
                </Box>
              )}
            </div>
            <div className="mb-[0.35rem]">
              <label htmlFor="name" className="text-[13px]">
                {t("Title")}
                <Box component="span" sx={{ fontSize: "13px", color: "error.main" }}>
                  {" "}
                  *
                </Box>
              </label>
              <TextField
                type="text"
                name="Name"
                size="small"
                fullWidth
                value={formData.Name}
                onChange={(e) => handleStrInput(e)}
                required
                inputProps={{
                  onInvalid: (e) =>
                    e.target.setCustomValidity(t("input-required")),
                  onInput: (e) => e.target.setCustomValidity("")
                }}
                sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
              />
            </div>
            <div className="mb-[0.35rem]">
              <label htmlFor="Note" className="text-[13px]">
                {t("report-heading.Note")}
              </label>
              <TextField
                type="text"
                name="Note"
                id="Note"
                size="small"
                fullWidth
                value={formData.Note}
                onChange={(e) => handleStrInput(e)}
                sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
              />
            </div>
            <div className="mb-[0.35rem]">
              <label htmlFor="Description" className="text-[13px]">
                {t("description")}
              </label>
              <TextField
                type="text"
                name="Description"
                id="Description"
                size="small"
                fullWidth
                value={formData.Description}
                onChange={(e) => handleStrInput(e)}
                sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
              />
            </div>
            <div className="mb-[0.35rem]">
              <label className="text-[13px]">{t("send-in-order")}</label>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { md: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", ml: "8px", mb: "5px" }}>
                  <Radio
                    size="small"
                    value={"true"}
                    name="SendinOrder"
                    checked={formData.SendinOrder === "true"}
                    onChange={handleStrInput}
                    sx={{ p: 0 }}
                  />
                  <div className="text-[12px]">{t("yes")}</div>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", ml: "8px", mb: "5px" }}>
                  <Radio
                    size="small"
                    value={"false"}
                    name="SendinOrder"
                    checked={formData.SendinOrder === "false"}
                    onChange={handleStrInput}
                    sx={{ p: 0 }}
                  />
                  <div className="text-[12px]">{t("no")}</div>
                </Box>
              </Box>
              {formData.SendinOrder === "true" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", ml: "8px", mt: "4px", mb: "5px" }}>
                  <Checkbox
                    size="small"
                    name="SendInOrderStrict"
                    checked={formData.SendInOrderStrict === "true"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        SendInOrderStrict: e.target.checked ? "true" : "false"
                      })
                    }
                    sx={{ p: 0 }}
                  />
                  <span
                    className="text-[12px]"
                    title={t("strict-order-help")}
                  >
                    {t("strict-order")}
                  </span>
                </Box>
              )}
            </div>
            <div className="text-xs mt-3">
              <label className="block">
                <span>
                  {t("enable-tour")}
                  <a data-tooltip-id="istourenabled-tooltip" className="ml-1">
                    <sup>
                      <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                    </sup>
                  </a>{" "}
                </span>
                <Tooltip id="istourenabled-tooltip" className="z-50">
                  <div className="max-w-[200px] md:max-w-[450px]">
                    <p className="font-bold">{t("enable-tour")}</p>
                    <div className="p-[5px]">
                      <ol className="list-disc">
                        <li>
                          <span className="font-bold">{t("yes")}: </span>
                          <span>{t("istourenabled-help.p1")}</span>
                        </li>
                        <li>
                          <span className="font-bold">{t("no")}: </span>
                          <span>{t("istourenabled-help.p2")}</span>
                        </li>
                      </ol>
                    </div>
                    <p>{t("istourenabled-help.p3", { appName: appName })}</p>
                  </div>
                </Tooltip>
              </label>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { md: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, mb: 0.5 }}>
                  <Radio
                    size="small"
                    value={"true"}
                    name="IsTourEnabled"
                    checked={formData.IsTourEnabled === "true"}
                    onChange={handleStrInput}
                    sx={{ p: 0 }}
                  />
                  <div className="text-center">{t("yes")}</div>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, mb: 0.5 }}>
                  <Radio
                    size="small"
                    value={"false"}
                    name="IsTourEnabled"
                    checked={formData.IsTourEnabled === "false"}
                    onChange={handleStrInput}
                    sx={{ p: 0 }}
                  />
                  <div className="text-center">{t("no")}</div>
                </Box>
              </Box>
            </div>
            <div className="text-xs mt-3">
              <label>
                {t("notify-on-signatures")}
                <a data-tooltip-id="nos-tooltip" className="ml-1">
                  <sup>
                    <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                  </sup>
                </a>{" "}
                <Tooltip id="nos-tooltip" className="z-[999]">
                  <div className="max-w-[200px] md:max-w-[450px] text-[11px]">
                    <p className="font-bold">{t("notify-on-signatures")}</p>
                    <p>{t("notify-on-signatures-help.p1")}</p>
                    <p>{t("notify-on-signatures-help.note")}</p>
                  </div>
                </Tooltip>
              </label>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { md: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, mb: 0.5 }}>
                  <Radio
                    size="small"
                    onChange={() => handleNotifySignChange(true)}
                    checked={formData.NotifyOnSignatures === true}
                    sx={{ p: 0, mr: "2px" }}
                  />
                  <div className="text-center">{t("yes")}</div>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, mb: 0.5 }}>
                  <Radio
                    size="small"
                    onChange={() => handleNotifySignChange(false)}
                    checked={formData.NotifyOnSignatures === false}
                    sx={{ p: 0, mr: "2px" }}
                  />
                  <div className="text-center">{t("no")}</div>
                </Box>
              </Box>
            </div>
            <div className="text-xs mt-3 mb-4">
              <label htmlFor="penColors">
                {t("pen-colors")}
                <a data-tooltip-id="pen-colors-tooltip" className="ml-1">
                  <sup>
                    <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                  </sup>
                </a>
                <Tooltip id="pen-colors-tooltip" className="z-[999]">
                  <div className="max-w-[200px] md:max-w-[450px]">
                    <p className="font-bold">{t("pen-colors")}</p>
                    <div>{t("pen-colors-help")}</div>
                  </div>
                </Tooltip>
              </label>
              <Box sx={{ ml: "7px", display: "flex", flexDirection: { xs: "column", md: "row" }, gap: "10px", mb: "0.7rem" }}>
                {pensList.map((color) => (
                  <Box
                    key={color}
                    sx={{ display: "flex", flexDirection: "row", gap: "5px", alignItems: "center" }}
                  >
                    <Checkbox
                      size="small"
                      name="penColors"
                      checked={selectedColors.includes(color)}
                      onChange={() => handleColorsChange(color)}
                      sx={{ p: 0, mr: "2px" }}
                    />
                    <div className="hover:underline underline-offset-2 cursor-default capitalize">
                      {color}
                    </div>
                  </Box>
                ))}
              </Box>
            </div>
            <div className="text-xs mt-3">
              <SignersInput
                label={t("Bcc")}
                initialData={template?.Bcc}
                onChange={handleBcc}
                zindex={50}
                helpText={t("bcc-help")}
                isCaptureAllData
                isAddYourSelfCheckbox={isAddYourSelfCheckbox}
              />
            </div>
            <div className="text-xs mt-3">
              <SignersInput
                label={t("Cc")}
                initialData={template?.Cc}
                onChange={handleCc}
                zindex={50}
                helpText={t("cc-help")}
                isCaptureAllData
                isAddYourSelfCheckbox={isAddYourSelfCheckbox}
              />
            </div>
            <div className="text-xs mt-2">
              <label className="block">{t("redirect-url")}</label>
              <TextField
                name="RedirectUrl"
                size="small"
                fullWidth
                value={formData.RedirectUrl}
                onChange={handleStrInput}
                inputProps={{
                  onInvalid: (e) =>
                    e.target.setCustomValidity(t("input-required")),
                  onInput: (e) => e.target.setCustomValidity("")
                }}
                sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
              />
            </div>
            <div className="text-xs mt-2">
              <label className="block">
                {t("time-to-complete")}
                <Box component="span" sx={{ color: "error.main", fontSize: "13px" }}>
                  *
                </Box>
              </label>
              <TextField
                type="number"
                name="TimeToCompleteDays"
                size="small"
                fullWidth
                value={formData.TimeToCompleteDays}
                onChange={(e) => handleStrInput(e)}
                required
                inputProps={{
                  min: 1,
                  onInvalid: (e) =>
                    e.target.setCustomValidity(t("input-required")),
                  onInput: (e) => e.target.setCustomValidity("")
                }}
                sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
              />
            </div>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
              <Button type="submit" variant="contained">
                {t("submit")}
              </Button>
            </Box>
          </form>
        </Box>
      </div>
    </ModalUi>
  );
};

export default EditTemplate;
