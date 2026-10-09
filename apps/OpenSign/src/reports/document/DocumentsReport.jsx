import React, { useState, useEffect, useRef } from "react";
import pad from "../../assets/images/pad.svg";
import recreatedoc from "../../assets/images/recreatedoc.png";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import ModalUi from "../../primitives/ModalUi";
import Alert from "../../primitives/Alert";
import Tooltip from "../../primitives/Tooltip";
import ShareButton from "../../primitives/ShareButton";
import DatePicker from "../../components/DatePicker";
import Parse from "parse";
import {
  formatDateToDdMmmYyyy,
  copytoData,
  fetchUrl,
  getSignedUrl,
  getTenantDetails,
  handleSignatureType,
  replaceMailVaribles,
  signatureTypes,
  openInNewTab,
  createDocument,
  getSignerEmail,
  defaultMailBody,
  defaultMailSubject
} from "../../constant/Utils";
import BulkSendUi from "../../components/bulksend/BulkSendUi";
import Loader from "../../primitives/Loader";
import { serverUrl_fn } from "../../constant/appinfo";
import { Trans, useTranslation } from "react-i18next";
import DownloadPdfZip from "../../primitives/DownloadPdfZip";
import { useElSize } from "../../hook/useElSize";
import PrefillWidgetModal from "../../components/pdf/PrefillWidgetsModal";
import LottieWithLoader from "../../primitives/DotLottieReact";
import * as utils from "../../utils";
import { RenderReportCell } from "../../primitives/RenderReportCell";
import CustomizeMail from "../../components/pdf/CustomizeMail";
import { useSelector } from "react-redux";
import EmailEditor from "../../components/emaileditor";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import MuiLink from "@mui/material/Link";

const DocumentsReport = (props) => {
  const copyUrlRef = useRef(null);
  const titleRef = useRef(null);
  const titleElement = useElSize(titleRef);
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { prefillImg, isBulkLoader } = useSelector((state) => state.widget);
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isRevoke, setIsRevoke] = useState({});
  const [isShare, setIsShare] = useState({});
  const [shareUrls, setShareUrls] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isOption, setIsOption] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isResendMail, setIsResendMail] = useState({});
  const [mail, setMail] = useState({ subject: "", body: "" });
  const [emailEditorType, setEmailEditorType] = useState("basic");
  const [userDetails, setUserDetails] = useState({});
  const [isNextStep, setIsNextStep] = useState({});
  const [isBulkSend, setIsBulkSend] = useState({});
  const [templateDetails, setTemplateDetails] = useState({});
  const [placeholders, setPlaceholders] = useState([]);
  const [isLoader, setIsLoader] = useState({});
  const [isModal, setIsModal] = useState({});
  const [reason, setReason] = useState("");
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [expiryDate, setExpiryDate] = useState(null);
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const [renameDoc, setRenameDoc] = useState("");
  const [isSuccess, setIsSuccess] = useState({});
  const [templateId, setTemplateId] = useState("");
  const [forms, setForms] = useState([]);
  const [xyPosition, setXyPosition] = useState([]);
  const [signerList, setSignerList] = useState([]);
  const [mailStatus, setMailStatus] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [isNewContact, setIsNewContact] = useState({ status: false, id: "" });
  const [isPrefillModal, setIsPrefillModal] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [error, setError] = useState("");
  const [resendErrMail, setResendErrMail] = useState("");
  const [isMailModal, setIsMailModal] = useState(false);
  const [customizeMail, setCustomizeMail] = useState({
    body: { basic: "", advanced: "" },
    subject: ""
  });
  const [defaultMail, setDefaultMail] = useState({ body: "", subject: "" });
  const [currUserId, setCurrUserId] = useState(false);
  const [documentDetails, setDocumentDetails] = useState();
  const [objInfoModal, setObjInfoModal] = useState({ title: "", info: "" });
  // presentation-only anchor for the MD3 signer-status filter menu
  const [filterAnchor, setFilterAnchor] = useState(null);
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;

  useEffect(() => {
    if (props.isSearchResult) {
      setCurrentPage(1);
    }
  }, [props.isSearchResult]);

  // Close dropdown when clicking outside or on button again
  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('[data-dropdown-root="1"]')) setIsOption({});
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(props.List.length / props.docPerPage);
    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!showLeftDots && showRightDots) {
        let leftItemCount = 3;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        pages.push(...leftRange);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3;
        let rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...rightRange);
      } else if (showLeftDots && showRightDots) {
        let middleRange = Array.from(
          { length: 3 },
          (_, i) => leftSiblingIndex + i
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...middleRange);
        pages.push("...");
        pages.push(lastPageIndex);
      }
    }

    return pages;
  };
  const showAlert = (type, message, time = 1500) => {
    setAlertMsg({ type: type, message: message });
    setTimeout(() => setAlertMsg({ type: "", message: "" }), time);
  };
  const pageNumbers = getPaginationRange();
  //  below useEffect reset currenpage to 1 if user change route
  useEffect(() => {
    return () => setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // below useEffect is used to render next record if IsMoreDoc is true
  // second last value of pageNumber array is same as currentPage
  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  //function to fetch tenant Details
  const fetchTenantDetails = utils.withSessionValidation(async () => {
    const user = JSON.parse(
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      )
    );
    if (user) {
      try {
        const tenantDetails = await getTenantDetails(user?.objectId);
        if (tenantDetails && tenantDetails === "user does not exist!") {
          alert(t("user-not-exist"));
        } else if (tenantDetails) {
          const signatureType = tenantDetails?.SignatureType || [];
          const filterSignTypes = signatureType?.filter(
            (x) => x.enabled === true
          );
          const extUser =
            localStorage.getItem("Extand_Class") &&
            JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
          const subject = tenantDetails?.RequestSubject ?? "";
          const body = tenantDetails?.RequestBody ?? "";
          //customize mail state is handle to when user want to customize already set tenant email format then use that format
          const userSubject =
                subject;
          const userBody =
                body;
          const finalBody = userBody || defaultMailBody;
          const emailEditorType =
                tenantDetails?.EmailEditorType;
          setEmailEditorType(emailEditorType?.request || "basic");
          setCustomizeMail({
            subject: userSubject || defaultMailSubject,
            body: { basic: finalBody, advanced: finalBody }
          });
          setDefaultMail({ subject: userSubject, body: userBody });
          return filterSignTypes;
        }
      } catch (e) {
        alert(t("user-not-exist"));
      }
    } else {
      alert(t("user-not-exist"));
    }
  });

  // `handleURL` is used to open microapp
  const handleURL = async (item, act) => {
    navigate(`/${act.redirectUrl}?docId=${item?.objectId}`);
  };

  const fetchTemplate = utils.withSessionValidation(async (templateId) => {
    try {
      const params = {
        templateId: templateId,
        include: ["Placeholders.signerPtr"]
      };
      const axiosRes = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getTemplate`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessionToken: localStorage.getItem("accesstoken")
          }
        }
      );
      if (axiosRes) {
        return axiosRes;
      }
    } catch (e) {
      console.error("fetch template in report error", e);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });
  //function is called when there ther no any prefill role widget exist then create direct document and navigate
  const navigatePageToDoc = utils.withSessionValidation(
    async (templateRes, placeholder, signer) => {
      setIsPrefillModal({});
      const res = await createDocument(
        [templateRes || templateDetails],
        placeholder || xyPosition,
        signer || signerList,
        templateRes?.URL || templateDetails?.URL,
      );
      if (res.status === "success") {
        navigate(`/placeHolderSign/${res.id}`, {
          state: { title: "Use Template" }
        });
      } else {
        alert(t("something-went-wrong-mssg"));
      }
    }
  );
  const handleUseTemplate = async (templateId, item) => {
    try {
      const templateRes = await fetchTemplate(templateId);
      const templateData = templateRes.data && templateRes.data.result;
      if (!templateData.error) {
        setTemplateDetails(templateData);
        setXyPosition(templateData?.Placeholders);
        const signer = utils.handleSignersList(templateData);
        setSignerList(signer);

        //this function is used to open modal to show signers list
        await utils?.handleDisplaySignerList(
          templateData?.Placeholders,
          templateData?.Signers,
          setForms
        );
        setIsModal({});
        setIsPrefillModal({ [item.objectId]: true });
      } else {
        showAlert("danger", t("something-went-wrong-mssg"));
        setActLoader({});
      }
    } catch (err) {
      console.error("use template error", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  };
  const handleActionBtn = utils.withSessionValidation(async (act, item) => {
    if (act.action === "redirect") {
      handleURL(item, act);
    } else if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "share") {
      handleShare(item);
    } else if (act.action === "revoke") {
      setIsRevoke({ [item.objectId]: true });
    } else if (act.action === "option") {
      setIsOption({ [item.objectId]: !isOption[item.objectId] });
    } else if (act.action === "resend") {
      setIsResendMail({ [item.objectId]: true });
    } else if (act.action === "rename") {
      setIsModal({ [`rename_${item.objectId}`]: true });
    } else if (act.action === "edit") {
      setIsModal({ [`edit_${item.objectId}`]: true });
    } else if (act.action === "saveastemplate") {
      setIsModal({ [`saveastemplate_${item.objectId}`]: true });
    } else if (act.action === "recreatedocument") {
      const isPrefill = item?.Placeholders?.some((p) => p.Role === "prefill");
      setError(isPrefill ? t("fix-resend-error") : "");
      setIsModal({ [`recreatedocument_${item.objectId}`]: true });
    } else if (act.action === "extendexpiry") {
      setExpiryDate(
        item?.ExpiryDate?.iso ? new Date(item?.ExpiryDate?.iso) : null
      );
      setIsModal({ [`extendexpiry_${item.objectId}`]: true });
    }
  });


  // Get current list
  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const sortedList = props.List;
  const currentList = sortedList?.slice(indexOfFirstDoc, indexOfLastDoc);

  // Change page
  const paginateFront = () => {
    const lastValue = pageNumbers?.[pageNumbers?.length - 1];
    if (currentPage < lastValue) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginateBack = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = utils.withSessionValidation(async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    try {
      const serverUrl = serverUrl_fn();
      const cls = "contracts_Document";
      const url = serverUrl + `/classes/${cls}/`;
      const body = { IsArchive: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        showAlert("success", t("record-delete-alert"));
        const upldatedList = props.List.filter(
          (x) => x.objectId !== item.objectId
        );
        props.setList(upldatedList);
      }
    } catch (err) {
      console.error("delete document error", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });
  const handleClose = () => {
    setIsRevoke({});
    setIsDeleteModal({});
    setReason("");
  };
  const handleShare = (item) => {
    setActLoader({ [item.objectId]: true });
    const host = window.location.origin;
    const sendMail = item?.SendMail || false;
    const getUrl = (x) => {
      //encode this url value `${item.objectId}/${x.Email}/${x.objectId}` to base64 using `btoa` function
      if (x?.signerObjId) {
        const encodeBase64 = btoa(
          `${item.objectId}/${getSignerEmail(x, item?.Signers)}/${x?.signerObjId}/${sendMail}`
        );
        return `${host}/login/${encodeBase64}`;
      } else {
        const encodeBase64 = btoa(`${item.objectId}/${x.email}`);
        return `${host}/login/${encodeBase64}`;
      }
    };
    const removePrefill = item?.Placeholders.filter(
      (data) => data?.Role !== "prefill"
    );
    const urls = removePrefill?.map((x) => ({
      email: getSignerEmail(x, item?.Signers) || x.email || "-",
      url: getUrl(x)
    }));
    setShareUrls(urls);
    setIsShare({ [item.objectId]: true });
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = text; // Update text safely
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset copied state after 1.5 seconds
  };
  const copybtn = (text, email) => {
    copytoData(text);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = text; // Update text safely
    }
    setCopied({ [email]: true });
  };
  //function to handle revoke/decline docment
  const handleRevoke = utils.withSessionValidation(async (item) => {
    const senderUser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const jsonSender = JSON.parse(senderUser);
    setIsRevoke({});
    setActLoader({ [`${item.objectId}`]: true });
    const params = {
      docId: item.objectId,
      reason: reason,
      userId: jsonSender?.objectId,
    };
    await axios
      .post(`${localStorage.getItem("baseUrl")}functions/declinedoc`, params, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      })
      .then(async (result) => {
        const res = result.data;
        if (res) {
          setActLoader({});
          showAlert("success", t("record-revoke-alert"));
          const upldatedList = props.List.filter(
            (x) => x.objectId !== item.objectId
          );
          props.setList(upldatedList);
        }
        setReason("");
      })
      .catch((err) => {
        console.error("decline document error", err);
        setReason("");
        showAlert("danger", t("something-went-wrong-mssg"));
        setActLoader({});
      });
  });

  // `handleDownload` is used to get valid doc url available in completed report
  const handleDownload = async (item) => {
    setActLoader({ [`${item.objectId}`]: true });
    const url = item?.SignedUrl || item?.URL || "";
    const pdfName =
      item?.Name?.length > 100
        ? item?.Name?.slice(0, 100)
        : item?.Name || "Document";
    const isCompleted = item?.IsCompleted || false;
    const formatId = item?.ExtUserPtr?.DownloadFilenameFormat;
    const docName = utils.buildDownloadFilename(formatId, {
      docName: pdfName,
      email: item?.ExtUserPtr?.Email,
      isSigned: isCompleted
    });
    const templateId = props?.ReportName === "Templates" && item.objectId;
    const docId = props?.ReportName !== "Templates" && item.objectId;
    if (url) {
      try {
        if (
          isCompleted
        ) {
          setIsDownloadModal({ [item.objectId]: true });
        } else {
          const signedUrl = await getSignedUrl(
            url,
            docId,
            templateId
          );
          await fetchUrl(signedUrl, docName);
        }
        setActLoader({});
      } catch (err) {
        console.error("getsignedurl error", err);
        alert(t("something-went-wrong-mssg"));
        setActLoader({});
      }
    }
  };

  // `handleSwitch` is used to change email editor from basic => advanced or vice versa
  const handleSwitch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const editor = emailEditorType === "basic" ? "advanced" : "basic";
    setEmailEditorType(editor);
  };

  // `handleSubjectChange` is used to add or change subject of resend mail
  const handleSubjectChange = (subject, doc) => {
    const encodeBase64 = userDetails?.objectId
      ? btoa(`${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`)
      : btoa(`${doc.objectId}/${userDetails.Email}`);
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      note: doc?.Note || "",
      sender_name:
        doc?.SenderName ||
        doc.ExtUserPtr.Name,
      sender_mail: doc?.SenderMail || doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name || "",
      receiver_email: userDetails?.Email,
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: signPdf
    };
    const res = replaceMailVaribles(subject, "", variables);
    setMail((prev) => ({ ...prev, subject: res.subject }));
  };

  // `handlebodyChange` is used to add or change body of resend mail
  const handlebodyChange = (body, doc, type) => {
    const encodeBase64 = userDetails?.objectId
      ? btoa(`${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`)
      : btoa(`${doc.objectId}/${userDetails.Email}`);
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      note: doc?.Note || "",
      sender_name:
        doc?.SenderName ||
        doc.ExtUserPtr.Name,
      sender_mail: doc?.SenderMail || doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name || "",
      receiver_email: userDetails?.Email || "",
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: signPdf
    };
    const res = replaceMailVaribles("", body, variables);

    if (body) {
      setMail((prev) => ({
        ...prev,
        body: { ...prev.body, [type]: res.body }
      }));
    }
  };
  // `handleNextBtn` is used to open edit mail template screen in resend mail modal
  // as well as replace variable with original one
  const handleNextBtn = (user, doc) => {
    const userdata = {
      Name: user?.signerPtr?.Name,
      Email: user.email ? user?.email : user.signerPtr?.Email,
      Phone: user?.signerPtr?.Phone,
      objectId: user?.signerPtr?.objectId
    };
    setUserDetails(userdata);
    const encodeBase64 = user.email
      ? btoa(`${doc.objectId}/${user.email}`)
      : btoa(
          `${doc.objectId}/${user.signerPtr.Email}/${user.signerPtr.objectId}`
        );
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      note: doc?.Note || "",
      sender_name:
        doc?.SenderName ||
        doc.ExtUserPtr.Name,
      sender_mail: doc?.SenderMail || doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: user?.signerPtr?.Name || "",
      receiver_email: user?.email ? user?.email : user?.signerPtr?.Email,
      receiver_phone: user?.signerPtr?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc?.ExtUserPtr?.Company || "",
      signing_url: signPdf
    };

    const subject =
      doc?.RequestSubject ||
      doc?.ExtUserPtr?.TenantId?.RequestSubject ||
      `{{sender_name}} has requested you to sign "{{document_title}}"`;
    const body =
      doc?.RequestBody ||
      doc?.ExtUserPtr?.TenantId?.RequestBody ||
      `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}} has requested you to review and sign <b>"{{document_title}}"</b>.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br></body> </html>`;
    const res = replaceMailVaribles(subject, body, variables);
    setMail((prev) => ({
      ...prev,
      subject: res.subject,
      body: { basic: res.body, advanced: res.body }
    }));
    setEmailEditorType(
      doc?.EmailEditorType?.request ||
        doc?.ExtUserPtr?.EmailEditorType?.request ||
        doc?.ExtUserPtr?.TenantId?.EmailEditorType?.request ||
        "basic"
    );
    setIsNextStep({ [user.Id]: true });
  };
  const handleResendMail = utils.withSessionValidation(async (e, doc, user) => {
    e.preventDefault();
    setActLoader({ [user?.Id]: true });
    const url = `${localStorage.getItem("baseUrl")}functions/sendmailv3`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      sessionToken: localStorage.getItem("accesstoken")
    };
    let params = {
      replyto: doc?.SenderMail || doc?.ExtUserPtr?.Email || "",
      extUserId: doc?.ExtUserPtr?.objectId,
      recipient: userDetails?.Email,
      subject: mail.subject,
      from:
        doc?.SenderName ||
        doc?.ExtUserPtr?.Email,
      html: emailEditorType === "basic" ? mail.body.basic : mail.body.advanced
    };
    try {
      const res = await axios.post(url, params, { headers: headers });
      if (res?.data?.result?.status === "success") {
        showAlert("success", t("mail-sent-alert"));
        setIsResendMail({});
      }
      else {
        setResendErrMail(t("something-went-wrong-mssg"));
      }
    } catch (err) {
      console.error("sendmail error", err);
      setResendErrMail(t("something-went-wrong-mssg"));
    } finally {
      setIsNextStep({});
      setUserDetails({});
      setActLoader({});
    }
  });
  const fetchUserStatus = (user, doc) => {
    const email = user.email ? user.email : user.signerPtr.Email;
    const audit = doc?.AuditTrail?.find((x) => x.UserPtr.Email === email);

    return (
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
        <Chip
          label={audit?.Activity ? audit?.Activity : "Awaited"}
          size="small"
          sx={{
            bgcolor: "surface.containerHighest",
            color: "text.primary",
            width: 65,
            height: 32,
            boxShadow: 1,
            cursor: "default"
          }}
        />

        {audit?.Activity !== "Signed" && (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleNextBtn(user, doc)}
          >
            Resend
          </Button>
        )}
      </Stack>
    );
  };
  // `handleQuickSendClose` is trigger when bulk send component trigger close event
  const handleQuickSendClose = (status, count) => {
    setIsBulkSend({});
    if (status === "success") {
      showAlert("success", count + " " + t("document-sent-alert"));
    } else {
      showAlert("danger", t("something-went-wrong-mssg"));
    }
  };

  const handleUpdateExpiry = utils.withSessionValidation(async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (expiryDate) {
      const oldExpiryDate = item?.ExpiryDate?.iso
        ? new Date(item?.ExpiryDate?.iso)
        : null;
      const newExpiryDate = new Date(expiryDate);
      const hasOldExpiry =
        oldExpiryDate && !Number.isNaN(oldExpiryDate.getTime());
      if (!hasOldExpiry || newExpiryDate > oldExpiryDate) {
        setActLoader({ [`${item.objectId}`]: true });
        const updateExpiryDate = new Date(expiryDate).toISOString();
        const expiryIsoFormat = { iso: updateExpiryDate, __type: "Date" };
        try {
          const serverUrl = serverUrl_fn();
          const cls = "contracts_Document";
          const url = serverUrl + `/classes/${cls}/`;
          const body = { ExpiryDate: expiryIsoFormat };
          const res = await axios.put(url + item.objectId, body, {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          });
          if (res.data && res.data.updatedAt) {
            showAlert(
              "success",
              t("expiry-date-updated", {
                newexpirydate: new Date(expiryDate)?.toLocaleDateString()
              }),
              2000
            );
            if (props.ReportName === "Expired Documents") {
              const upldatedList = props.List.filter(
                (x) => x.objectId !== item.objectId
              );
              props.setList(upldatedList);
            }
          }
        } catch (err) {
          console.error("update expiry doc error", err);
          showAlert("danger", t("something-went-wrong-mssg"), 2000);
        } finally {
          setActLoader({});
          setExpiryDate();
          setIsModal({});
        }
      } else {
        showAlert("danger", t("expiry-date-error"), 2000);
      }
    } else {
      showAlert("danger", t("expiry-date-error"), 2000);
    }
  });

  // `handleRenameDoc` is used to update document name
  const handleRenameDoc = utils.withSessionValidation(async (item) => {
    setActLoader({ [item.objectId]: true });
    setIsModal({});
    const className = "contracts_Document";
    try {
      const query = new Parse.Query(className);
      const docObj = await query.get(item.objectId);
      docObj.set("Name", renameDoc);
      await docObj.save();
      //update report list data
      const updateList = props.List.map((x) =>
        x.objectId === item.objectId ? { ...x, Name: renameDoc } : x
      );
      props.setList(updateList);
      setActLoader({});
      showAlert("success", "Document updated", 2000);
    } catch (err) {
      showAlert("danger", t("something-went-wrong-mssg"), 2000);
      setActLoader({});
    }
  });
  const handleBtnVisibility = (act, item) => {
    if (!act.restrictBtn) {
      return true;
    } else if (
      act.restrictBtn === true &&
      item.ExtUserPtr?.objectId === extClass?.[0]?.objectId
    ) {
      return true;
    }
  };

  const handleCloseModal = () => {
    setError("");
    setIsModal({});
  };
  const handleSaveAsTemplate = utils.withSessionValidation(async (doc) => {
    try {
      const params = { docId: doc?.objectId };
      const templateRes = await Parse.Cloud.run("saveastemplate", params);
      setTemplateId(templateRes?.id);
      setIsSuccess({ [doc.objectId]: true });
    } catch (err) {
      console.error("saveastemplate error", err);
    } finally {
      setActLoader({});
    }
  });
  const handleCloseTemplate = () => {
    setTemplateId("");
    setIsSuccess({});
    handleCloseModal();
    setActLoader({});
    handleClose();
  };

  // `handleBulkSendTemplate` is used to open modal as well as fetch template
  // and show Ui on the basis template response
  const handleBulkSendTemplate = utils.withSessionValidation(
    async (templateId, docId) => {
      setIsBulkSend({ [docId]: true });
      setIsLoader({ [docId]: true });
      try {
        const axiosRes = await fetchTemplate(templateId);
        const templateRes = axiosRes.data && axiosRes.data.result;
        const tenantSignTypes = await fetchTenantDetails();
        const docSignTypes = templateRes?.SignatureType || signatureTypes;
        const updatedSignatureType = await handleSignatureType(
          tenantSignTypes,
          docSignTypes
        );
        setSignatureType(updatedSignatureType);
        setPlaceholders(templateRes?.Placeholders);
        setTemplateDetails(templateRes);
        setIsLoader({});
      } catch (err) {
        console.error("fetch template in bulk modal error", err);
        setIsBulkSend({});
        showAlert("danger", t("something-went-wrong-mssg"));
      }
    }
  );

  const handleResendClose = () => {
    setIsResendMail({});
    setIsNextStep({});
    setUserDetails({});
  };

  const handleRecreateDoc = utils.withSessionValidation(async (item) => {
    setActLoader({ [item.objectId]: true });
    try {
      const res = await Parse.Cloud.run("recreatedoc", {
        docId: item.objectId
      });
      if (res) {
        openInNewTab(`/placeHolderSign/${res.objectId}`, "_self");
      }
    } catch (err) {
      handleCloseModal();
      showAlert("danger", err.message);
      // showAlert("danger", t("something-went-wrong-mssg"));
      console.error("create duplicate template error", err);
    } finally {
      setActLoader({});
    }
  });

  const restrictBtn = (item, act) => {
    return item.IsSignyourself && act.action === "recreatedocument"
      ? true
      : false;
  };
  // `handleAddUser` is used to adduserAdd commentMore actions
  const handleAddUser = (data, id) => {
    const signerPtr = {
      __type: "Pointer",
      className: "contracts_Contactbook",
      objectId: data.objectId
    };
    const updatePlaceHolder = xyPosition.map((x) => {
      if (x.signerObjId === id || x.Id === id) {
        return { ...x, signerPtr: signerPtr, signerObjId: data.objectId };
      }
      return { ...x };
    });
    setXyPosition(updatePlaceHolder);
    const updateSigner = signerList.map((y) => {
      //condition is used to updated signer's email
      if (y.objectId === id) {
        return data;
      }
      //condition is used to add new signer's mail to role
      else if (y.Id === id) {
        return { ...y, ...data, className: "contracts_Contactbook" };
      }
      return { ...y };
    });
    setSignerList(updateSigner);

    //condition when there are any new signer add then save that signer in dropdown option
    if (isNewContact.status) {
      let newForm = [...forms];
      const label = `${data.Name}<${data.Email}>`;
      const index = newForm.findIndex((x) => x.value === id);
      newForm[index].label = label;
      newForm[index].value = id;
      setForms(newForm);
    }
  };
  const handleClosePrefillModal = () => {
    setIsPrefillModal(false);
    setActLoader({});
    setForms([]);
    setXyPosition([]);
  };
  //`handlePrefillWidgetCreateDoc` is used to embed prefill all widgets on document, create document, and send document
  const handlePrefillWidgetCreateDoc = async () => {
    setIsSubmit(true);
    const scale = 1;
    const key = Object.keys(isPrefillModal)[0];
    setActLoader({ [key]: true });
    const res = await utils?.handleCheckPrefillCreateDoc(
      xyPosition,
      signerList,
      setIsPrefillModal,
      scale,
      templateDetails?.URL,
      [templateDetails],
      prefillImg,
      extClass?.[0]?.UserId?.objectId,
    );
    if (res?.status === "unfilled") {
      const emptyWidget = res?.emptyResponseObjects
        ?.map((item) => item.options.name)
        ?.join(", ");
      const timeInMiliSec = 6000;
      showAlert(
        "danger",
        t("prefill-unfilled-widget", {
          emptyWidget: emptyWidget ? `[${emptyWidget}]` : ""
        }),
        timeInMiliSec
      );
    } else if (res?.status === "unattach signer") {
      showAlert("danger", t("attach-all-role-to-signer"));
    } else if (res?.status === "success") {
      setDocumentId(res.id);
      setActLoader({});
      setIsMailModal(true);

      try {
        await fetchTenantDetails();
      } catch (e) {
        console.error("fetchTenantDetails error", e);
        alert(t("user-not-exist"));
      }
    } else if (res?.status === "error") {
      const message = res?.message || "something-went-wrong-mssg";
      showAlert("danger", t(message));
    }
    setIsSubmit(false);
    setActLoader({});
  };
  const handleRecipientSign = (documentId, currentId) => {
    if (currentId) {
      navigate(`/recipientSignPdf/${documentId}/${currentId}`);
    } else {
      navigate(`/recipientSignPdf/${documentId}`);
    }
  };
  //function show signer list and share link to share signUrl
  const handleShareList = () => {
    const shareLinkList = [];
    let signerMail = signerList;
    for (let i = 0; i < signerMail.length; i++) {
      const objectId = signerMail[i].objectId;
      const hostUrl = window.location.origin;
      const sendMail = false;
      //encode this url value `${documentId}/${signerMail[i].Email}/${objectId}` to base64 using `btoa` function
      const encodeBase64 = btoa(
        `${documentId}/${signerMail[i].Email}/${objectId}/${sendMail}`
      );
      let signPdf = `${hostUrl}/login/${encodeBase64}`;
      shareLinkList.push({
        signerEmail: signerMail[i].Email,
        url: signPdf
      });
    }
    return shareLinkList.map((data, ind) => {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5
          }}
          key={ind}
        >
          {copied && <Alert type="success">{t("copied")}</Alert>}
          <Box
            component="span"
            sx={{
              width: { xs: 220, md: 300 },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {data.signerEmail}
          </Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Button
              onClick={() => copytoclipboard(data.url)}
              type="button"
              variant="text"
              startIcon={<i className="fa-light fa-copy" />}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", md: "block" } }}
              >
                {t("copy-link")}
              </Box>
            </Button>
            <ShareButton
              title={t("sign-url")}
              text={t("sign-url")}
              url={data.url}
            >
              <Box
                component="i"
                className="fa-light fa-share-from-square"
                sx={{ color: "secondary.main" }}
              ></Box>
            </ShareButton>
          </Stack>
        </Box>
      );
    });
  };
  const handleRemovePrefill = (placeholders) => {
    const removePrefill = placeholders?.filter(
      (data) => data?.Role !== "prefill"
    );
    return removePrefill;
  };
  const handleCloseMail = () => {
    handleRecipientSign(documentId);
  };
  //function is used to show warning message when use save as template
  const handleWarning = (item) => {
    const isPrefill = item?.Placeholders?.some((x) => x?.Role === "prefill");
    if (isPrefill) {
      return (
        <Box
          component="span"
          sx={{ display: "flex", fontSize: "0.875rem", mt: 1.5, color: "error.main" }}
        >
          {t("save-as-temp-warn")}
        </Box>
      );
    }
  };

  const handleItemClick = (title, info) => {
    setObjInfoModal({ title, info });
  };
  return (
    <Box sx={{ position: "relative" }}>
      {Object.keys(actLoader)?.length > 0 && (
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
      )}
      <Card sx={{ p: 1, width: "100%", bgcolor: "surface.main", color: "text.primary", boxShadow: 3 }}>
        {alertMsg.message && (
          <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        <Box
          ref={titleRef}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            my: 1,
            mx: 1.5,
            fontSize: { xs: "20px", md: "23px" }
          }}
        >
          <Box sx={{ fontWeight: 300 }}>
            {t(`report-name.${props.ReportName}`)}{" "}
            {props.report_help && (
              <Box component="span" sx={{ fontSize: { xs: "0.75rem", md: "13px" }, fontWeight: 400 }}>
                <Tooltip
                  id="report_help"
                  message={t(`report-help.${props.ReportName}`)}
                />
              </Box>
            )}
          </Box>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            {/* Search input for report bigger in width */}
            {titleElement?.width > 500 && (
              <Box sx={{ display: "flex" }}>
                <TextField
                  type="search"
                  size="small"
                  value={props.searchTerm}
                  onChange={props.handleSearchChange}
                  placeholder={t("search-documents")}
                  onPaste={props.handleSearchPaste}
                  sx={{ width: 256 }}
                  inputProps={{ sx: { fontSize: "0.75rem" } }}
                />
              </Box>
            )}
            {/* search icon/magnifer icon  */}
            {titleElement?.width < 500 && (
              <IconButton
                aria-label="Search"
                sx={{ fontSize: "18px", color: "text.primary" }}
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
              >
                <i className="fa-light fa-magnifying-glass"></i>
              </IconButton>
            )}
            {props.openColumnModal && (
              <IconButton
                aria-label="Columns"
                sx={{ fontSize: "18px", color: "text.primary" }}
                onClick={props.openColumnModal}
              >
                <i className="fa-light fa-table-columns"></i>
              </IconButton>
            )}
            {props?.ReportName === "In-progress documents" && (
              <>
                <IconButton
                  aria-label="Filter"
                  sx={{ fontSize: "18px", color: "text.primary" }}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  <i className="fa-light fa-filter"></i>
                </IconButton>
                <Menu
                  anchorEl={filterAnchor}
                  open={Boolean(filterAnchor)}
                  onClose={() => setFilterAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    onClick={() => {
                      props.handleSignerStatusFilter("all");
                      setFilterAnchor(null);
                    }}
                  >
                    {t("all-signer-status")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      props.handleSignerStatusFilter("viewed");
                      setFilterAnchor(null);
                    }}
                  >
                    {t("viewed")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      props.handleSignerStatusFilter("signed");
                      setFilterAnchor(null);
                    }}
                  >
                    {t("signed")}
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
        </Box>
        {/* Search input for report smalle in width */}
        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <Box sx={{ width: "100%", px: 1.5, pt: 0.5, pb: 1.5 }}>
            <TextField
              type="search"
              size="small"
              fullWidth
              value={props.searchTerm}
              onChange={props.handleSearchChange}
              placeholder={t("search-documents")}
              onPaste={props.handleSearchPaste}
              inputProps={{ sx: { fontSize: "0.75rem" } }}
            />
          </Box>
        )}
        <div
          className={`overflow-auto w-full border-b ${
            props.List?.length > 0
              ? isDashboard
                ? "min-h-[317px]"
                : currentList?.length === props.docPerPage
                  ? "h-fit"
                  : "h-screen"
              : ""
          }`}
        >
          <Table sx={{ borderCollapse: "collapse", width: "100%", mb: 2 }}>
            <TableHead>
              <TableRow sx={{ borderTop: 1, borderBottom: 1, borderColor: "divider" }}>
                {props.heading?.map((item, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{ p: 1, fontSize: "14px", color: "text.primary" }}
                  >
                    {props.columnLabels?.[item] ||
                      t(`report-heading.${item}`, { defaultValue: item })}
                  </TableCell>
                ))}
                {props.actions?.length > 0 && (
                  <TableCell
                    align="center"
                    sx={{
                      p: 1,
                      fontSize: "14px",
                      color: "transparent",
                      pointerEvents: "none"
                    }}
                  >
                    {t("action")}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody sx={{ fontSize: "12px" }}>
              {props.List?.length > 0 &&
                !props.searchLoader &&
                currentList.map((item, index) => (
                  <TableRow
                    className={`${
                      currentList?.length === props.docPerPage
                        ? "last:border-none"
                        : ""
                    } border-y-[1px] `}
                    key={index}
                  >
                    {props?.heading?.map((col) => (
                      <RenderReportCell
                        key={col}
                        col={col}
                        rowData={item}
                        rowIndex={index}
                        startIndex={startIndex}
                        handleDownload={handleDownload}
                        handleRemovePrefill={handleRemovePrefill}
                        reportName={props.ReportName}
                        handleItemClick={handleItemClick}
                      />
                    ))}
                    {/* actions */}
                    <TableCell sx={{ px: 1, py: 1 }}>
                      <Box
                        sx={{
                          color: "text.primary",
                          minWidth: "max-content",
                          display: "flex",
                          flexDirection: "row",
                          columnGap: 1,
                          rowGap: 0.5,
                          justifyContent: "flex-start",
                          alignItems: "center"
                        }}
                      >
                        {props.actions?.length > 0 &&
                          props.actions.map((act, index) => (
                            <React.Fragment key={index}>
                              {handleBtnVisibility(act, item) &&
                                (act.action !== "option" ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    data-dropdown-root="1"
                                    data-tut={act?.selector}
                                    onClick={() => handleActionBtn(act, item)}
                                    title={t(`btnLabel.${act.hoverLabel}`)}
                                    className={act?.btnColor || undefined}
                                    sx={{ mr: 0.5, minWidth: 0 }}
                                  >
                                    <i className={act.btnIcon}></i>
                                    {act.btnLabel && (
                                      <Box
                                        component="span"
                                        sx={{
                                          textTransform: "uppercase",
                                          fontWeight: 500,
                                          ml: 0.5
                                        }}
                                      >
                                        {t(`btnLabel.${act.btnLabel}`)}
                                      </Box>
                                    )}
                                  </Button>
                                ) : (
                                  <Box
                                    data-dropdown-root="1"
                                    role="button"
                                    data-tut={act?.selector}
                                    onClick={() => handleActionBtn(act, item)}
                                    title={t(`btnLabel.${act.hoverLabel}`)}
                                    sx={{
                                      color: "text.primary",
                                      fontSize: "1.125rem",
                                      mr: 1,
                                      position: "relative",
                                      cursor: "pointer"
                                    }}
                                  >
                                    <i className={act.btnIcon}></i>
                                    {act.btnLabel && (
                                      <Box
                                        component="span"
                                        sx={{
                                          textTransform: "uppercase",
                                          fontWeight: 500
                                        }}
                                      >
                                        {t(`btnLabel.${act.btnLabel}`)}
                                      </Box>
                                    )}
                                    {/* doc report */}
                                    {isOption[item.objectId] && (
                                      <Paper
                                        elevation={4}
                                        sx={{
                                          position: "absolute",
                                          right: -4,
                                          top: "auto",
                                          zIndex: 70,
                                          width: "max-content",
                                          bgcolor: "surface.main",
                                          color: "text.primary",
                                          borderRadius: 2,
                                          py: 0.5
                                        }}
                                      >
                                        {act.subaction?.map(
                                          (subact) =>
                                            !restrictBtn(item, subact) && (
                                              <MenuItem
                                                key={subact.btnId}
                                                dense
                                                onClick={() =>
                                                  handleActionBtn(subact, item)
                                                }
                                                title={t(
                                                  `btnLabel.${subact.hoverLabel}`
                                                )}
                                              >
                                                <i
                                                  className={`${subact.btnIcon} mr-1.5`}
                                                ></i>
                                                {subact.btnLabel && (
                                                  <Box
                                                    component="span"
                                                    sx={{
                                                      fontSize: "13px",
                                                      textTransform: "capitalize",
                                                      fontWeight: 500
                                                    }}
                                                  >
                                                    {t(
                                                      `btnLabel.${subact.btnLabel}`
                                                    )}
                                                  </Box>
                                                )}
                                              </MenuItem>
                                            )
                                        )}
                                      </Paper>
                                    )}
                                  </Box>
                                ))}
                            </React.Fragment>
                          ))}
                      </Box>
                      {isModal["recreatedocument_" + item.objectId] && (
                        <ModalUi isOpen handleClose={handleCloseModal}>
                          {actLoader[item.objectId] && (
                            <Box
                              sx={{
                                position: "absolute",
                                height: "100%",
                                width: "100%",
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
                          <Box
                            component="h3"
                            sx={{
                              color: "text.primary",
                              fontWeight: 700,
                              fontSize: "1.125rem",
                              pt: "15px",
                              px: "20px"
                            }}
                          >
                            {t("fix-&-resend-document")}
                          </Box>
                          {error ? (
                            <Box sx={{ p: { xs: "15px", md: "20px" } }}>{error}</Box>
                          ) : (
                            <Box sx={{ p: { xs: "15px", md: "20px" } }}>
                              <Box sx={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "center" }}>
                                <img
                                  src={recreatedoc}
                                  alt="recreate-doc"
                                  className="mx-auto w-[200px] h-auto"
                                />
                                <Box component="p" sx={{ fontSize: { xs: "0.875rem", md: "1rem" }, px: { md: 1 }, mt: 1 }}>
                                  {t("do-you-want-recreate-document?")}
                                </Box>
                              </Box>
                              <Divider sx={{ mt: 1.25 }} />
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mt: { xs: "14px", md: "16px" },
                                  gap: 1
                                }}
                              >
                                <Button
                                  variant="contained"
                                  onClick={() => handleRecreateDoc(item)}
                                  sx={{ px: 2 }}
                                >
                                  {t("start-editing")}
                                </Button>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={handleCloseModal}
                                  sx={{ px: 4 }}
                                >
                                  {t("cancel")}
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </ModalUi>
                      )}
                      {isModal["saveastemplate_" + item.objectId] && (
                        <ModalUi
                          isOpen
                          title={
                            isSuccess[item.objectId]
                              ? t("template-created")
                              : t("btnLabel.Save as template")
                          }
                          handleClose={handleCloseTemplate}
                        >
                          {isSuccess[item.objectId] ? (
                            <Box sx={{ mx: "10px", my: "15px" }}>
                              <Box component="p" sx={{ fontSize: "1rem", textAlign: "center" }}>
                                {t("how-would-you-like-to-proceed?")}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mt: 1
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<i className="fa-light fa-plus"></i>}
                                  onClick={() =>
                                    handleUseTemplate(templateId, item)
                                  }
                                >
                                  {t("btnLabel.Use")}
                                </Button>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  startIcon={<i className="fa-light fa-plus"></i>}
                                  onClick={() =>
                                    handleBulkSendTemplate(
                                      templateId,
                                      item.objectId
                                    )
                                  }
                                >
                                  {`${t(`btnLabel.Quick send`)}`}
                                </Button>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  startIcon={<i className="fa-light fa-pen"></i>}
                                  onClick={() =>
                                    navigate(`/template/${templateId}`)
                                  }
                                >
                                  {t(`btnLabel.Edit`)}
                                </Button>
                              </Box>
                              <MuiLink
                                component={Link}
                                to="/report/6TeaPr321t"
                                sx={{
                                  cursor: "pointer",
                                  fontSize: "0.875rem",
                                  width: "100%",
                                  display: "flex",
                                  justifyContent: "center",
                                  mt: 1
                                }}
                              >
                                {t("go-to-manage-templates")}
                              </MuiLink>
                            </Box>
                          ) : (
                            <Box sx={{ m: "20px" }}>
                              {error ? (
                                <>{error}</>
                              ) : (
                                <>
                                  <Box sx={{ fontSize: "1.125rem", fontWeight: 400, color: "text.primary" }}>
                                    {t("save-as-template-?")}
                                    {handleWarning(item)}
                                  </Box>
                                  <Divider sx={{ mt: 1.5 }} />
                                  <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
                                    <Button
                                      variant="contained"
                                      onClick={() => handleSaveAsTemplate(item)}
                                      sx={{ width: 100 }}
                                    >
                                      {t("yes")}
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="secondary"
                                      onClick={handleCloseTemplate}
                                      sx={{ width: 100 }}
                                    >
                                      {t("no")}
                                    </Button>
                                  </Box>
                                </>
                              )}
                            </Box>
                          )}
                        </ModalUi>
                      )}
                      {isPrefillModal[item.objectId] && (
                        <PrefillWidgetModal
                          isPrefillModal={isPrefillModal[item.objectId]}
                          prefillData={xyPosition.find(
                            (x) => x.Role === "prefill"
                          )}
                          forms={forms}
                          setForms={setForms}
                          xyPosition={xyPosition}
                          setXyPosition={setXyPosition}
                          handleCreateDocument={handlePrefillWidgetCreateDoc}
                          handleClosePrefillModal={handleClosePrefillModal}
                          handleAddUser={handleAddUser}
                          navigatePageToDoc={navigatePageToDoc}
                          setIsNewContact={setIsNewContact}
                          isNewContact={isNewContact}
                          docId={item.objectId}
                          isSubmit={isSubmit}
                        />
                      )}
                      {isModal["extendexpiry_" + item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("btnLabel.extend-expiry-date")}
                          reduceWidth={"md:max-w-[450px]"}
                          handleClose={handleCloseModal}
                        >
                          <Box
                            component="form"
                            sx={{ px: 2, py: 1, display: "flex", flexDirection: "column", width: "100%" }}
                            onSubmit={(e) => handleUpdateExpiry(e, item)}
                          >
                            <Box sx={{ fontSize: "0.875rem", mb: 1 }}>
                              <Box component="span" sx={{ fontWeight: 500, mr: 0.5 }}>
                                {t("current-expiry-date")}:
                              </Box>
                              {item?.ExpiryDate?.iso
                                ? formatDateToDdMmmYyyy(
                                    new Date(item?.ExpiryDate?.iso)
                                  )
                                : t("no-data")}
                            </Box>
                            <Box component="label" sx={{ mr: 1 }}>
                              {t("expiry-date")} {"(dd-mm-yyyy)"}
                            </Box>
                            <Box sx={{ width: "100%" }}>
                              <DatePicker
                                selectDate={{
                                  date: expiryDate,
                                  format: "dd-MM-yyyy"
                                }}
                                format="dd-MM-yyyy"
                                onChange={(date) => setExpiryDate(date)}
                                handleClear={() => setExpiryDate(null)}
                                showLabel={false}
                                showClear={false}
                                dateClassName="text-sm md:text-base"
                              />
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 0.5, mt: 1.5 }}>
                              <Button type="submit" variant="contained">
                                {t("update")}
                              </Button>
                            </Box>
                          </Box>
                        </ModalUi>
                      )}
                      {isDeleteModal[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("delete-document")}
                          handleClose={handleClose}
                        >
                          <Box sx={{ m: "20px" }}>
                            <Box sx={{ fontSize: "1.125rem", fontWeight: 400, color: "text.primary" }}>
                              {t("delete-document-alert")}
                            </Box>
                            <Divider sx={{ mt: 2 }} />
                            <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
                              <Button
                                variant="contained"
                                onClick={() => handleDelete(item)}
                              >
                                {t("yes")}
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleClose}
                              >
                                {t("no")}
                              </Button>
                            </Box>
                          </Box>
                        </ModalUi>
                      )}
                      {isBulkSend[item.objectId] && (
                        <ModalUi
                          isOpen
                          showScrollBar
                          title={
                                t("quick-send")
                          }
                          reduceWidth={"md:min-w-[80%]"}
                          isLoader={isBulkLoader}
                          handleClose={() => setIsBulkSend({})}
                        >
                          {isLoader[item.objectId] ? (
                            <Box sx={{ width: "100%", height: 100, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 30 }}>
                              <Loader />
                            </Box>
                          ) : (
                            <>
                              {!extClass?.[0]?.UserId?.emailVerified ? (
                                <Box sx={{ mx: "20px", mt: "15px", mb: "20px" }}>
                                  <Trans
                                    i18nKey="email-not-verified-send"
                                    components={{
                                      1: (
                                        <MuiLink
                                          component={Link}
                                          to="/profile"
                                          sx={{ cursor: "pointer" }}
                                        />
                                      )
                                    }}
                                  />
                                </Box>
                              ) : (
                                <BulkSendUi
                                  Placeholders={placeholders}
                                  item={templateDetails}
                                  handleClose={handleQuickSendClose}
                                  signatureType={signatureType}
                                />
                              )}
                            </>
                          )}
                        </ModalUi>
                      )}
                      {isShare[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("copy-link")}
                          handleClose={() => {
                            setIsShare({});
                            setActLoader({});
                            setCopied(false);
                          }}
                        >
                          <Box sx={{ m: "20px" }}>
                            {shareUrls.map((share, i) => (
                              <Box
                                key={i}
                                sx={{
                                  fontSize: "0.875rem",
                                  fontWeight: 400,
                                  color: "text.primary",
                                  display: "flex",
                                  my: 1,
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    width: { xs: 150, md: 300 },
                                    mr: { xs: "5px", md: 0 },
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: "0.875rem",
                                    fontWeight: 600
                                  }}
                                >
                                  {share.email}
                                </Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <ShareButton
                                    title={t("sign-url")}
                                    text={t("sign-url")}
                                    url={share.url}
                                    className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm "
                                  >
                                    <i className="fa-light fa-share-from-square"></i>
                                    {t("btnLabel.Share")}
                                  </ShareButton>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<i className="fa-light fa-copy" />}
                                    onClick={() =>
                                      copybtn(share.url, share.email)
                                    }
                                  >
                                    {copied[share.email]
                                      ? t("copied")
                                      : t("copy")}
                                  </Button>
                                </Stack>
                              </Box>
                            ))}
                            <Box component="p" ref={copyUrlRef} sx={{ display: "none" }}></Box>
                          </Box>
                        </ModalUi>
                      )}
                      {isRevoke[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("revoke-document")}
                          handleClose={handleClose}
                        >
                          <Box sx={{ m: "20px" }}>
                            <Box sx={{ fontSize: { xs: "0.875rem", md: "1.125rem" }, fontWeight: 400, color: "text.primary" }}>
                              {t("revoke-document-alert")}
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              <TextField
                                multiline
                                rows={3}
                                fullWidth
                                size="small"
                                placeholder="Reason (optional)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                inputProps={{ sx: { fontSize: "0.75rem" } }}
                              />
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
                              <Button
                                variant="contained"
                                onClick={() => handleRevoke(item)}
                                sx={{ px: 3 }}
                              >
                                {t("yes")}
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleClose}
                                sx={{ px: 3 }}
                              >
                                {t("no")}
                              </Button>
                            </Box>
                          </Box>
                        </ModalUi>
                      )}
                      {isResendMail[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={
                                t("resend-mail")
                          }
                          handleClose={handleResendClose}
                        >
                            <Box sx={{ overflowY: "auto", maxHeight: { xs: 340, md: 400 } }}>
                              {item?.Placeholders?.filter(
                                (user) => user?.Role !== "prefill"
                              )?.map((user) => (
                                <React.Fragment key={user.Id}>
                                  {isNextStep[user.Id] && (
                                    <Box sx={{ position: "relative" }}>
                                      {actLoader[user.Id] && (
                                        <Box sx={{ position: "absolute", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "rgba(0,0,0,0.3)", zIndex: 60 }}>
                                          <Loader />
                                        </Box>
                                      )}
                                      <Box
                                        component="form"
                                        onSubmit={(e) =>
                                          handleResendMail(e, item, user)
                                        }
                                        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, p: 1.5, color: "text.primary", position: "relative" }}
                                      >
                                        <Box sx={{ position: "absolute", right: 20, fontSize: "0.75rem", zIndex: 40 }}>
                                          <Tooltip
                                            id={`${user.Id}_help`}
                                            message={t("resend-mail-help")}
                                          />
                                        </Box>
                                        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, color: "text.primary", position: "relative" }}>
                                          <Box>
                                            <Box
                                              component="label"
                                              sx={{ fontSize: "0.75rem", ml: 0.5 }}
                                              htmlFor="mailsubject"
                                            >
                                              {t("subject")}{" "}
                                            </Box>
                                            <TextField
                                              id="mailsubject"
                                              size="small"
                                              fullWidth
                                              value={mail.subject}
                                              onChange={(e) =>
                                                handleSubjectChange(
                                                  e.target.value,
                                                  item
                                                )
                                              }
                                              onInvalid={(e) =>
                                                e.target.setCustomValidity(
                                                  t("input-required")
                                                )
                                              }
                                              onInput={(e) =>
                                                e.target.setCustomValidity("")
                                              }
                                              required
                                              inputProps={{ sx: { fontSize: "0.75rem" } }}
                                            />
                                          </Box>
                                          <Box>
                                            <Box
                                              component="label"
                                              sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", ml: 0.5 }}
                                              htmlFor="mailbody"
                                            >
                                              <Box component="span">{t("body")} </Box>
                                              <MuiLink
                                                component="button"
                                                type="button"
                                                onClick={(e) => handleSwitch(e)}
                                              >
                                                {emailEditorType === "basic"
                                                  ? t("switch-to-advanced")
                                                  : t("switch-to-basic")}
                                              </MuiLink>
                                            </Box>
                                            <EmailEditor
                                              type={emailEditorType}
                                              values={mail.body || ""}
                                              onChange={(value, type) =>
                                                handlebodyChange(
                                                  value,
                                                  item,
                                                  type
                                                )
                                              }
                                              smallscreen
                                            />
                                          </Box>
                                        </Box>
                                        <Button type="submit" variant="contained">
                                          {t("resend")}
                                        </Button>
                                      </Box>
                                    </Box>
                                  )}
                                  {Object?.keys(isNextStep) <= 0 && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, my: 1, px: 1.5 }}>
                                      <Box sx={{ color: "text.primary" }}>
                                        {user?.signerPtr?.Name || "-"}{" "}
                                        {`<${
                                          user?.email
                                            ? user.email
                                            : user.signerPtr.Email
                                        }>`}
                                      </Box>
                                      <>{fetchUserStatus(user, item)}</>
                                    </Box>
                                  )}
                                </React.Fragment>
                              ))}
                            </Box>
                        </ModalUi>
                      )}
                      <ModalUi
                        title={t("btnLabel.Rename")}
                        isOpen={isModal["rename_" + item.objectId]}
                        handleClose={handleCloseModal}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", px: 2, pb: 1.5, pt: 1 }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              autoFocus
                              type="text"
                              defaultValue={renameDoc || item.Name}
                              onChange={(e) => setRenameDoc(e.target.value)}
                              inputProps={{ maxLength: 200, sx: { fontSize: "10px" } }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", flexDirection: "row", gap: 1, pt: 1.5, mt: 1.5, borderTop: "1.5px solid", borderColor: "outline.variant" }}>
                            <Button
                              variant="contained"
                              sx={{ width: 100 }}
                              onClick={() => handleRenameDoc(item)}
                            >
                              {t("save")}
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              sx={{ width: 100 }}
                              onClick={handleCloseModal}
                            >
                              {t("cancel")}
                            </Button>
                          </Box>
                        </Box>
                      </ModalUi>
                      {isDownloadModal[item.objectId] && (
                        <DownloadPdfZip
                          setIsDownloadModal={setIsDownloadModal}
                          isDownloadModal={isDownloadModal[item.objectId]}
                          pdfDetails={[item]}
                          isDocId={false}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {(props.searchLoader || props.List?.length <= 0) && (
            <Box
              className={isDashboard ? "h-[317px]" : ""}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                bgcolor: "surface.main",
                color: "text.primary",
                borderRadius: 3,
                py: 2
              }}
            >
              {props.searchLoader ? (
                <>
                  <Loader />
                  <Box sx={{ fontSize: "0.875rem" }}>{t("loading-mssg")}</Box>
                </>
              ) : (
                <>
                  <Box sx={{ width: 60, height: 60, overflow: "hidden" }}>
                    <img
                      className="w-full h-full object-contain"
                      src={pad}
                      alt={t("no-data-available")}
                    />
                  </Box>
                  <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    {t("no-data-available")}
                  </Box>
                </>
              )}
            </Box>
          )}
        </div>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.5, p: 1 }}>
          {props.List.length > props.docPerPage && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => paginateBack()}
            >
              {t("prev")}
            </Button>
          )}
          {pageNumbers.map((x, i) => (
            <Button
              key={i}
              variant={x === currentPage ? "contained" : "outlined"}
              size="small"
              onClick={() => setCurrentPage(x)}
              disabled={x === "..."}
              sx={{ minWidth: 40 }}
            >
              {x}
            </Button>
          ))}
          {props.List.length > props.docPerPage && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => paginateFront()}
            >
              {t("next")}
            </Button>
          )}
        </Box>
        <ModalUi
          isOpen={resendErrMail}
          id="error-modal"
          title={t("error")}
          handleClose={() => setResendErrMail("")}
        >
          <Box sx={{ mx: "20px", mb: "20px", mt: "10px" }}>
            {resendErrMail === "emailnotverified" ? (
              <Trans
                i18nKey="email-not-verified-send"
                components={{
                  1: (
                    <MuiLink
                      component={Link}
                      to="/profile"
                      sx={{ cursor: "pointer" }}
                    />
                  )
                }}
              />
            ) : (
              <Box component="p">{resendErrMail}</Box>
            )}
          </Box>
        </ModalUi>
        <CustomizeMail
          setIsMailModal={setIsMailModal}
          setCustomizeMail={setCustomizeMail}
          documentId={documentId}
          signerList={signerList}
          setIsSend={setIsSend}
          setMailStatus={setMailStatus}
          customizeMail={customizeMail}
          defaultMail={defaultMail}
          isMailModal={isMailModal}
          setCurrUserId={setCurrUserId}
          handleShareList={handleShareList}
          setDocumentDetails={setDocumentDetails}
          handleClose={handleCloseMail}
          copyUrlRef={copyUrlRef}
          emailEditorType={emailEditorType}
          setEmailEditorType={setEmailEditorType}
        />
        <ModalUi
          isOpen={isSend}
          title={
            mailStatus === "success"
              ? t("mails-sent")
              : mailStatus === "quotareached"
                ? t("quota-mail-head")
                : mailStatus === "emailnotverified"
                  ? t("email-not-verified-head")
                  : t("mail-not-delivered")
          }
          handleClose={() => {
            setIsSend(false);
            navigate("/report/1MwEuxLEkF");
          }}
        >
          <Box sx={{ height: "100%", p: "20px", color: "text.primary" }}>
            {mailStatus === "success" ? (
              <Box sx={{ textAlign: "center", mb: "10px" }}>
                <LottieWithLoader />
                {documentDetails?.SendinOrder ? (
                  <Box component="p">
                    {currUserId
                      ? t("placeholder-mail-alert-you")
                      : t("placeholder-mail-alert", {
                          name: signerList[0]?.Name
                        })}
                  </Box>
                ) : (
                  <Box component="p">{t("placeholder-alert-4")}</Box>
                )}
                {currUserId && <Box component="p">{t("placeholder-alert-5")}</Box>}
              </Box>
            ) : mailStatus === "quotareached" ? (
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 1.5 }}>
                <Box sx={{ my: 1.5 }}>{handleShareList()}</Box>
              </Box>
            ) : mailStatus === "emailnotverified" ? (
              <Box component="p">
                <Trans
                  i18nKey="email-not-verified-send"
                  components={{
                    1: (
                      <MuiLink
                        href="/profile"
                        sx={{ cursor: "pointer" }}
                      />
                    )
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ mb: "10px" }}>
                {mailStatus === "dailyquotareached" ? (
                  <Box component="p">{t("daily-quota-reached")}</Box>
                ) : (
                  <Box component="p">{t("placeholder-alert-6")}</Box>
                )}
                {currUserId && (
                  <Box component="p" sx={{ mt: 0.5 }}>{t("placeholder-alert-5")}</Box>
                )}
              </Box>
            )}
            {!mailStatus && (
              <Divider sx={{ my: "15px" }} />
            )}
            {mailStatus !== "quotareached" && (
              <Box
                sx={
                  mailStatus === "success" || mailStatus === "emailnotverified"
                    ? { display: "flex", justifyContent: "center", mt: 0.5 }
                    : undefined
                }
              >
                {currUserId && (
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleRecipientSign(documentDetails?.objectId, currUserId)
                    }
                    type="button"
                    sx={{ mr: 0.5 }}
                  >
                    {t("yes")}
                  </Button>
                )}
                <Button
                  variant="text"
                  onClick={() => {
                    handleRecipientSign(documentDetails?.objectId, currUserId);
                  }}
                  type="button"
                  sx={{ color: "text.primary" }}
                >
                  {currUserId ? t("no") : t("close")}
                </Button>
              </Box>
            )}
          </Box>
        </ModalUi>
        <ModalUi
          title={t(`report-heading.${objInfoModal.title}`)}
          isOpen={objInfoModal.title}
          handleClose={() => setObjInfoModal({ title: "", info: "" })}
        >
          <Box sx={{ p: "20px" }}>{objInfoModal.info || "-"}</Box>
        </ModalUi>
      </Card>
    </Box>
  );
};

export default DocumentsReport;
