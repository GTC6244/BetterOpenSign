import React, { useState, useEffect, useRef } from "react";
import pad from "../../assets/images/pad.svg";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import ModalUi from "../../primitives/ModalUi";
import Alert from "../../primitives/Alert";
import Tooltip from "../../primitives/Tooltip";
import ShareButton from "../../primitives/ShareButton";
import Tour from "../../primitives/Tour";
import Parse from "parse";
import {
  copytoData,
  fetchUrl,
  getSignedUrl,
  getTenantDetails,
  handleSignatureType,
  replaceMailVaribles,
  signatureTypes,
  createDocument,
  defaultMailBody,
  defaultMailSubject
} from "../../constant/Utils";
import BulkSendUi from "../../components/bulksend/BulkSendUi";
import Loader from "../../primitives/Loader";
import { serverUrl_fn } from "../../constant/appinfo";
import { Trans, useTranslation } from "react-i18next";
import { useElSize } from "../../hook/useElSize";
import LottieWithLoader from "../../primitives/DotLottieReact";
import PrefillWidgetModal from "../../components/pdf/PrefillWidgetsModal";
import * as utils from "../../utils";
import { useDispatch, useSelector } from "react-redux";
import { RenderReportCell } from "../../primitives/RenderReportCell";
import CustomizeMail from "../../components/pdf/CustomizeMail";
import { resetWidgetState } from "../../redux/reducers/widgetSlice";
import EmailEditor from "../../components/emaileditor";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Divider from "@mui/material/Divider";

const isSignExist = (placeholders = []) => {
  const isSignature =
    Array.isArray(placeholders) &&
    placeholders?.length > 0 &&
    placeholders.every((p) => {
      return p?.placeHolder?.some((h) =>
        h?.pos?.some((x) => x?.type === "signature")
      );
    });
  return isSignature;
};

const TemplatesReport = (props) => {
  const copyUrlRef = useRef(null);
  const titleRef = useRef(null);
  const dispatch = useDispatch();
  const titleElement = useElSize(titleRef);
  const { prefillImg, isBulkLoader } = useSelector((state) => state.widget);
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isShare, setIsShare] = useState({});
  const [shareUrls, setShareUrls] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isOption, setIsOption] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [isResendMail, setIsResendMail] = useState({});
  const [mail, setMail] = useState({
    subject: "",
    body: { basic: "", advanced: "" }
  });
  const [emailEditorType, setEmailEditorType] = useState("basic");
  const [userDetails, setUserDetails] = useState({});
  const [isNextStep, setIsNextStep] = useState({});
  const [isBulkSend, setIsBulkSend] = useState({});
  const [templateDetails, setTemplateDetails] = useState({});
  const [placeholders, setPlaceholders] = useState([]);
  const [isLoader, setIsLoader] = useState({});
  const [isShareWith, setIsShareWith] = useState({});
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [isModal, setIsModal] = useState({});
  const [signatureType, setSignatureType] = useState([]);
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const [renameDoc, setRenameDoc] = useState("");
  const [forms, setForms] = useState([]);
  const [xyPosition, setXyPosition] = useState([]);
  const [signerList, setSignerList] = useState([]);
  const [mailStatus, setMailStatus] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [isNewContact, setIsNewContact] = useState({ status: false, id: "" });
  const [isPrefillModal, setIsPrefillModal] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [objInfoModal, setObjInfoModal] = useState({ title: "", info: "" });
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;
  const [isMailModal, setIsMailModal] = useState(false);
  const [customizeMail, setCustomizeMail] = useState({
    body: { basic: "", advanced: "" },
    subject: ""
  });
  const [defaultMail, setDefaultMail] = useState({ body: "", subject: "" });
  const [currUserId, setCurrUserId] = useState("");
  const [documentDetails, setDocumentDetails] = useState();
  const [docId, setDocId] = useState();
  const [error, setError] = useState("");

  useEffect(() => {
    if (props.isSearchResult) {
      setCurrentPage(1);
    }
  }, [props.isSearchResult]);

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
    dispatch(resetWidgetState([]));
    checkTourStatus();
    fetchTeamList();
    return () => setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside or on button again
  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('[data-dropdown-root="1"]')) setIsOption({});
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // `fetchTeamList` is used to fetch team list for share with functionality
  const fetchTeamList = async () => {
    try {
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      if (extUser?.OrganizationId?.objectId) {
        const teamtRes = await Parse.Cloud.run("getteams", { active: true });
        if (teamtRes.length > 0) {
          const _teamRes = JSON.parse(JSON.stringify(teamtRes));
            const selected = _teamRes.map(
              (x) =>
                x.Name === "All Users" && {
                  label: x.Name,
                  value: x.objectId
                }
            );
            setSelectedTeam(selected);
        }
      }
    } catch (err) {
      console.error("fetch top level teamlist error", err);
    }
  };
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
    if (act.hoverLabel === "Edit") {
        navigate(`/${act.redirectUrl}/${item.objectId}`);
    } else {
      // handle Use template
      const placeholder = item?.Placeholders || [];
      const signers = placeholder?.filter((x) => x.Role !== "prefill");
      //condition to check atleast one role is present for use template
      if (signers && signers?.length > 0) {
        const isSignatureExist = isSignExist(signers);
        if (isSignatureExist) {
          setActLoader({ [`${item.objectId}_${act.btnId}`]: true });
          const template = await fetchTemplate(item.objectId);
          const templateData = template.data && template.data.result;
          if (!templateData.error) {
            setXyPosition(templateData?.Placeholders);
            const signer = utils.handleSignersList(templateData);
            setSignerList(signer);
            setTemplateDetails(templateData);
            //this function is used to open modal to show signers list
            await utils?.handleDisplaySignerList(
              item?.Placeholders,
              item?.Signers,
              setForms
            );
            setIsPrefillModal({ [item.objectId]: true });
          } else {
            showAlert("danger", t("something-went-wrong-mssg"));
            setActLoader({});
          }
        } else {
          showAlert("danger", t("quick-send-alert-2"));
        }
      } else {
        showAlert("danger", t("add-role-alert"));
      }
    }
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
      if (axiosRes?.data) {
        return axiosRes;
      }
    } catch (e) {
      console.error("fetch template in report error", e);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });
  //function is called when there are no any prefill role widget exist then create direct document and navigate
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

  const handleActionBtn = utils.withSessionValidation(async (act, item) => {
    setIsTour(false);
    if (act.action === "redirect") {
      handleURL(item, act);
    } else if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "share") {
      handleShare(item);
    } else if (act.action === "option") {
      setIsOption({ [item.objectId]: !isOption[item.objectId] });
    } else if (act.action === "resend") {
      setIsResendMail({ [item.objectId]: true });
    } else if (act.action === "bulksend") {
      handleBulkSend(item);
    } else if (act.action === "sharewithteam") {
      if (item?.SharedWith && item?.SharedWith.length > 0) {
        // below code is used to get existing sharewith teams and formated them as per react-select
        const formatedList = item?.SharedWith.map((x) => ({
          label: x.Name,
          value: x.objectId
        }));
        setSelectedTeam(formatedList);
      }
      setIsShareWith({ [item.objectId]: true });
    }
    else if (act.action === "duplicate") {
      const hasDuplicate = utils.hasDuplicateWidgetNames(item?.Placeholders);
      if (hasDuplicate) {
        setError(t("duplicate-template-widget-error"));
        setIsModal({ [`duplicate_${item.objectId}`]: true });
      } else {
        setIsModal({ [`duplicate_${item.objectId}`]: true });
      }
    } else if (act.action === "rename") {
      setIsModal({ [`rename_${item.objectId}`]: true });
    } else if (act.action === "edit") {
      setIsModal({ [`edit_${item.objectId}`]: true });
    } else if (act.action === "saveastemplate") {
      setIsModal({ [`saveastemplate_${item.objectId}`]: true });
    } else if (act.action === "extendexpiry") {
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
      const cls = "contracts_Template";
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
      console.error("delete template error", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });
  const handleClose = (
  ) => {
    setIsDeleteModal({});
  };
  const handleShare = (item) => {
    setActLoader({ [item.objectId]: true });
    const host = window.location.origin;
    const sendMail = item?.SendMail || false;
    const getUrl = (x) => {
      //encode this url value `${item.objectId}/${x.Email}/${x.objectId}` to base64 using `btoa` function
      if (x?.signerObjId) {
        const encodeBase64 = btoa(
          `${item.objectId}/${x.signerPtr.Email}/${x.signerPtr.objectId}/${sendMail}`
        );
        return `${host}/login/${encodeBase64}`;
      } else {
        const encodeBase64 = btoa(`${item.objectId}/${x.email}`);
        return `${host}/login/${encodeBase64}`;
      }
    };
    const placeholders = item?.Placeholders.filter(
      (data) => data?.Role !== "prefill"
    );
    const urls = placeholders?.map((x) => ({
      email: x.email ? x.email : x.signerPtr.Email,
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

  async function checkTourStatus() {
    const cloudRes = await Parse.Cloud.run("getUserDetails");
    if (cloudRes) {
      const extUser = JSON.parse(JSON.stringify(cloudRes));
      localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
      const tourStatus = extUser?.TourStatus || [];
      setTourStatusArr(tourStatus);
      const tour =
        tourStatus?.find((obj) => obj.templateReport)?.templateReport || false;
      setIsTour(!tour);
    } else {
      setIsTour(true);
    }
  }

  const closeTour = async () => {
    setIsTour(false);
    const isTourSaved =
      tourStatusArr?.some((obj) => obj.templateReport) || false;
    if (!isTourSaved) {
      const serverUrl = localStorage.getItem("baseUrl");
      const appId = localStorage.getItem("parseAppId");
      const json = JSON.parse(localStorage.getItem("Extand_Class"));
      const extUserId = json && json.length > 0 && json[0].objectId;
      let updatedTourStatus = [];
      if (tourStatusArr.length > 0) {
        updatedTourStatus = [...tourStatusArr];
        const templateReportIndex = tourStatusArr.findIndex(
          (obj) =>
            obj["templateReport"] === false || obj["templateReport"] === true
        );
        if (templateReportIndex !== -1) {
          updatedTourStatus[templateReportIndex] = { templateReport: true };
        } else {
          updatedTourStatus.push({ templateReport: true });
        }
      } else {
        updatedTourStatus = [{ templateReport: true }];
      }

      await axios.put(
        serverUrl + "classes/contracts_Users/" + extUserId,
        { TourStatus: updatedTourStatus },
        { headers: { "X-Parse-Application-Id": appId } }
      );
    }
  };

  // `handleDownload` is used to get valid doc url available in completed report
  const handleDownload = async (item) => {
    setActLoader({ [`${item.objectId}`]: true });
    const url = item?.SignedUrl || item?.URL || "";
    const pdfName =
      item?.Name?.length > 100
        ? item?.Name?.slice(0, 100)
        : item?.Name || "template";
    const templateId = item.objectId;
    const isCompleted = item?.IsCompleted || false;
    const formatId = item?.ExtUserPtr?.DownloadFilenameFormat;
    const docName = utils?.buildDownloadFilename(formatId, {
      docName: pdfName,
      email: item?.ExtUserPtr?.Email,
      isSigned: isCompleted
    });
    if (url) {
      try {
        const signedUrl = await getSignedUrl(
          url,
          "", //docId
          templateId
        );
        await fetchUrl(signedUrl, docName);

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
  const handleNextBtn = utils.withSessionValidation((user, doc) => {
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
    setEmailEditorType(
      doc?.EmailEditorType?.request ||
        doc?.ExtUserPtr?.EmailEditorType?.request ||
        doc?.ExtUserPtr?.TenantId?.EmailEditorType?.request ||
        "basic"
    );
    setMail((prev) => ({
      ...prev,
      subject: res.subject,
      body: { basic: res.body, advanced: res.body }
    }));
    setIsNextStep({ [user.Id]: true });
  });
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
      replyto:
        doc?.ExtUserPtr?.Email ||
        "",
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
        showAlert("danger", t("something-went-wrong-mssg"));
      }
    } catch (err) {
      console.error("sendmail error", err);
      showAlert("danger", t("something-went-wrong-mssg"));
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "surface.containerHighest",
            color: "text.primary",
            boxShadow: 2,
            borderRadius: 1,
            width: 65,
            height: 32,
            cursor: "default"
          }}
        >
          {audit?.Activity ? audit?.Activity : "Awaited"}
        </Box>

        {audit?.Activity !== "Signed" && (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleNextBtn(user, doc)}
          >
            Resend
          </Button>
        )}
      </Box>
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

  // `handleBulkSend` is used to open modal as well as fetch template
  // and show Ui on the basis template response handleBulkSendTemplate
  const handleBulkSend = async (template) => {
    setIsBulkSend({ [template.objectId]: true });
    setIsLoader({ [template.objectId]: true });
    try {
      const axiosRes = await fetchTemplate(template.objectId);
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
      console.error("fetch template in bulk modal err", err);
      setIsBulkSend({});
      showAlert("danger", t("something-went-wrong-mssg"));
    }
  };


  // `handleShareWith` is used to save teams in sharedWith field
  const handleShareWith = utils.withSessionValidation(async (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareWith({});
    setActLoader({ [template.objectId]: true });
    try {
      const templateCls = new Parse.Object("contracts_Template");
      templateCls.id = template.objectId;
      const teamArr = selectedTeam.map((x) => ({
        __type: "Pointer",
        className: "contracts_Teams",
        objectId: x.value
      }));
      templateCls.set("SharedWith", teamArr);
      const res = await templateCls.save();
      if (res) {
        showAlert("success", t("template-share-alert"));
      }
    } catch (err) {
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      setActLoader({});
    }
  });

  // `handleCreateDuplicate` is used to create duplicate from current entry using objectId
  const handleCreateDuplicate = utils.withSessionValidation(async (item) => {
    setActLoader({ [item.objectId]: true });
    setIsModal({});
    try {
      const duplicateRes = await Parse.Cloud.run("createduplicate", {
        templateId: item.objectId
      });
      if (duplicateRes) {
        const newTemplate = JSON.parse(JSON.stringify(duplicateRes));
        props.setList((prevData) => [newTemplate, ...prevData]);
        showAlert("success", t("duplicate-template-created"));
      }
    } catch (err) {
      showAlert("danger", t("something-went-wrong-mssg"));
      console.error("create duplicate template error", err);
    } finally {
      setActLoader({});
    }
  });
  // `handleRenameDoc` is used to update document name
  const handleRenameDoc = utils.withSessionValidation(async (item) => {
    setActLoader({ [item.objectId]: true });
    setIsModal({});
    const className = "contracts_Template";

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

  const handleCloseModal = () => {
    setIsModal({});
  };

  const handleResendClose = () => {
    setIsResendMail({});
    setIsNextStep({});
    setUserDetails({});
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
  const handlePrefillWidgetCreateDoc = utils.withSessionValidation(async () => {
    setIsSubmit(true);
    const scale = 1;
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
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      const ownerId = templateDetails.ExtUserPtr?.UserId?.objectId;
      const firstSigner = signerList[0];
      const isOwner = firstSigner?.UserId?.objectId === ownerId;
      setDocId(res.id);
      if (templateDetails?.SendinOrder && isOwner) {
        setCurrUserId(firstSigner?.objectId);
        setIsSend(true);
      } else {
        setIsMailModal(true);
        const currentSigner = signerList?.find(
          (x) => x?.UserId?.objectId === ownerId
        );
        if (currentSigner) {
          setCurrUserId(currentSigner?.objectId);
        }
      }
      if (user) {
        try {
          const tenantDetails = await getTenantDetails(user?.objectId);
          if (tenantDetails && tenantDetails === "user does not exist!") {
            alert(t("user-not-exist"));
          } else if (tenantDetails) {
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
                  tenantDetails?.EmailEditorType?.request;
            setEmailEditorType(emailEditorType || "basic");
            setCustomizeMail({
              subject: userSubject || defaultMailSubject,
              body: { basic: finalBody, advanced: finalBody }
            });
            setDefaultMail({ subject: userSubject, body: userBody });
          }
        } catch (e) {
          alert(t("user-not-exist"));
        }
      } else {
        alert(t("user-not-exist"));
      }
    } else if (res?.status === "error") {
      const message = res?.message || "something-went-wrong-mssg";
      showAlert("danger", t(message));
    }
    setIsSubmit(false);
  });
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
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1.5 }}>
            <Button
              onClick={() => copytoclipboard(data.url)}
              type="button"
              variant="text"
              size="small"
              startIcon={<i className="fa-light fa-copy" />}
            >
              <Box component="span" sx={{ display: { xs: "none", md: "block" } }}>
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
          </Box>
        </Box>
      );
    });
  };
  const filteredPlaceholders = (placeholders = []) => {
    const filtered = placeholders?.filter((data) => data?.Role !== "prefill");
    return filtered;
  };
  const handleRecipientSign = (docId, currUserId) => {
    if (currUserId) {
      navigate(`/recipientSignPdf/${docId}/${currUserId}`);
    } else {
      navigate(`/recipientSignPdf/${docId}`);
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
      <Box
        sx={{
          p: 1,
          width: "100%",
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        {alertMsg.message && (
          <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        {props.tourData && (
          <>
            <Tour
              onRequestClose={closeTour}
              steps={props.tourData}
              isOpen={isTour}
            />
          </>
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
            <Box
              component="sup"
              sx={{ cursor: "pointer" }}
              onClick={() => setIsTour(true)}
            >
              <Box
                component="i"
                className="fa-light fa-question"
                sx={{
                  color: "info.main",
                  border: "1px solid",
                  borderColor: "info.main",
                  borderRadius: "50%",
                  py: "1.5px",
                  px: "4px",
                  fontSize: "13px"
                }}
              ></Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.5,
              mb: 1
            }}
          >
            {/* Search input for report bigger in width */}
            {titleElement?.width > 500 && (
              <TextField
                type="search"
                size="small"
                value={props.searchTerm}
                onChange={props.handleSearchChange}
                placeholder={t("search-templates")}
                onPaste={props.handleSearchPaste}
                sx={{ width: 256 }}
                inputProps={{ style: { fontSize: "0.75rem" } }}
              />
            )}
            {/* create template form  */}
            <Box
              data-tut="reactourFirst"
              sx={{ cursor: "pointer", display: "flex" }}
              onClick={() => navigate("/form/template")}
            >
              <Box
                component="i"
                className="fa-light fa-square-plus"
                sx={{
                  cursor: "pointer",
                  color: "secondary.main",
                  fontSize: { xs: "30px", md: "32px" }
                }}
              ></Box>
            </Box>
            {/* search icon/magnifer icon  */}
            {titleElement?.width < 500 && (
              <IconButton
                aria-label="Search"
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
                sx={{ fontSize: "18px", color: "text.primary" }}
              >
                <i className="fa-light fa-magnifying-glass"></i>
              </IconButton>
            )}
            {props.openColumnModal && (
              <IconButton
                aria-label="Columns"
                onClick={props.openColumnModal}
                sx={{ fontSize: "18px", color: "text.primary" }}
              >
                <i className="fa-light fa-table-columns"></i>
              </IconButton>
            )}
          </Box>
        </Box>
        {/* Search input for report smalle in width */}
        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <Box sx={{ width: "100%", px: 1.5, pt: 0.5, pb: 1.5 }}>
            <TextField
              type="search"
              size="small"
              value={props.searchTerm}
              onChange={props.handleSearchChange}
              placeholder={t("search-documents")}
              onPaste={props.handleSearchPaste}
              fullWidth
              inputProps={{ style: { fontSize: "0.75rem" } }}
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
          <Table size="small" sx={{ width: "100%", mb: 2 }}>
            <TableHead>
              <TableRow>
                {props.heading?.map((item, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{ fontSize: "14px", p: 1 }}
                  >
                    {props.columnLabels?.[item] ||
                      t(`report-heading.${item}`, { defaultValue: item })}
                  </TableCell>
                ))}
                {props.actions?.length > 0 && (
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "14px",
                      p: 1,
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
                  <TableRow key={index}>
                    {props?.heading?.map((col) => (
                      <RenderReportCell
                        key={col}
                        col={col}
                        rowData={item}
                        rowIndex={index}
                        startIndex={startIndex}
                        handleDownload={handleDownload}
                        handleRemovePrefill={filteredPlaceholders}
                        reportName={props.ReportName}
                        handleItemClick={handleItemClick}
                      />
                    ))}
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
                              {(item.ExtUserPtr?.objectId ===
                                extClass?.[0]?.objectId ||
                                act.btnLabel === "Use") &&
                                (act.action !== "option" ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    data-tut={act?.selector}
                                    data-dropdown-root="1"
                                    onClick={() => handleActionBtn(act, item)}
                                    title={t(`btnLabel.${act.hoverLabel}`)}
                                    className={act?.btnColor || undefined}
                                    sx={{ mr: 0.5 }}
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
                                        {`${t(`btnLabel.${act.btnLabel}`)}`}
                                      </Box>
                                    )}
                                  </Button>
                                ) : (
                                  <Box
                                    role="button"
                                    data-tut={act?.selector}
                                    data-dropdown-root="1"
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
                                          fontWeight: 500,
                                          ml: 0.5
                                        }}
                                      >
                                        {`${t(`btnLabel.${act.btnLabel}`)}`}
                                      </Box>
                                    )}
                                    {/* template report */}
                                    {isOption[item.objectId] &&
                                      act.action === "option" && (
                                        <Box
                                          component="ul"
                                          sx={{
                                            position: "absolute",
                                            right: -4,
                                            top: "auto",
                                            zIndex: 70,
                                            width: 208,
                                            listStyle: "none",
                                            m: 0,
                                            p: 1,
                                            boxShadow: 3,
                                            bgcolor: "surface.container",
                                            color: "text.primary",
                                            borderRadius: 2
                                          }}
                                        >
                                          {act.subaction?.map((subact) => (
                                            <Box
                                              component="li"
                                              key={subact.btnId}
                                              onClick={() =>
                                                handleActionBtn(subact, item)
                                              }
                                              title={t(
                                                `btnLabel.${subact.btnLabel}`
                                              )}
                                              sx={{
                                                cursor: "pointer",
                                                borderRadius: 1,
                                                px: 1,
                                                py: 0.75,
                                                "&:hover": {
                                                  bgcolor:
                                                    "surface.containerHighest"
                                                }
                                              }}
                                            >
                                              <Box
                                                component="span"
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "space-between"
                                                }}
                                              >
                                                <Box
                                                  component="span"
                                                  sx={{
                                                    fontSize: "13px",
                                                    textTransform: "capitalize",
                                                    fontWeight: 500
                                                  }}
                                                >
                                                  <i
                                                    className={`${subact.btnIcon} mr-2`}
                                                  ></i>
                                                  {subact.btnLabel &&
                                                    t(
                                                      `btnLabel.${subact.btnLabel}`
                                                    )}
                                                  <Box
                                                    component="span"
                                                    sx={{ ml: 0.5 }}
                                                  >
                                                    {subact?.help && (
                                                      <Tooltip
                                                        id={`${subact.btnLabel}-${item.objectId}`}
                                                        message={t(subact?.help)}
                                                      />
                                                    )}
                                                  </Box>
                                                </Box>
                                                {subact.secIcon && (
                                                  <i
                                                    className={`${subact.secIcon} ml-1.5`}
                                                  ></i>
                                                )}
                                              </Box>
                                            </Box>
                                          ))}
                                        </Box>
                                      )}
                                  </Box>
                                ))}
                              <ModalUi
                                title={t("btnLabel.Duplicate")}
                                isOpen={isModal["duplicate_" + item.objectId]}
                                handleClose={handleCloseModal}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    px: 2,
                                    pb: 1.5,
                                    pt: 1
                                  }}
                                >
                                  {error ? (
                                    <>{error}</>
                                  ) : (
                                    <>
                                      <Box
                                        component="p"
                                        sx={{ fontSize: "1rem" }}
                                      >
                                        {t("duplicate-template-alert")}
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          gap: 1,
                                          pt: 1.5,
                                          mt: 1.5,
                                          borderTop: "1.5px solid",
                                          borderColor: "outline.variant"
                                        }}
                                      >
                                        <Button
                                          variant="contained"
                                          sx={{ width: 100 }}
                                          onClick={() =>
                                            handleCreateDuplicate(item)
                                          }
                                        >
                                          {t("yes")}
                                        </Button>
                                        <Button
                                          variant="contained"
                                          color="secondary"
                                          sx={{ width: 100 }}
                                          onClick={handleCloseModal}
                                        >
                                          {t("no")}
                                        </Button>
                                      </Box>
                                    </>
                                  )}
                                </Box>
                              </ModalUi>
                            </React.Fragment>
                          ))}
                      </Box>
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
                      {isShareWith[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("share-with")}
                          handleClose={() => setIsShareWith({})}
                        >
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Box sx={{ px: 1, mt: 1.5, width: "100%" }}>
                              <Box
                                sx={{
                                  width: "100%",
                                  border: "1px solid",
                                  borderColor: "outline.main",
                                  borderRadius: 1,
                                  px: 1,
                                  py: 1,
                                  fontSize: "13px",
                                  wordBreak: "break-all"
                                }}
                              >
                                {selectedTeam?.[0]?.label}
                              </Box>
                            </Box>
                            <Button
                              variant="contained"
                              onClick={(e) => handleShareWith(e, item)}
                              sx={{ ml: 1.25, my: 1.5 }}
                            >
                              {t("submit")}
                            </Button>
                          </Box>
                        </ModalUi>
                      )}
                      {isDeleteModal[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("delete-document")}
                          handleClose={handleClose}
                        >
                          <Box sx={{ m: 2.5 }}>
                            <Box
                              sx={{
                                fontSize: "1.125rem",
                                fontWeight: 400,
                                color: "text.primary"
                              }}
                            >
                              {t("delete-document-alert")}
                            </Box>
                            <Divider sx={{ mt: 2 }} />
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1.5,
                                gap: 1
                              }}
                            >
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
                            <Box
                              sx={{
                                width: "100%",
                                height: 100,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 30
                              }}
                            >
                              <Loader />
                            </Box>
                          ) : (
                            <>
                              {!extClass?.[0]?.UserId?.emailVerified ? (
                                <Box sx={{ mx: 2.5, mt: 2, mb: 2.5 }}>
                                  <Trans
                                    i18nKey="email-not-verified-send"
                                    components={{
                                      1: (
                                        <Link
                                          to="/profile"
                                          className="text-blue-700 underline cursor-pointer"
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
                          <Box sx={{ m: 2.5 }}>
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
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1
                                  }}
                                >
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
                                </Box>
                              </Box>
                            ))}
                            <Box
                              component="p"
                              ref={copyUrlRef}
                              sx={{ display: "none" }}
                            ></Box>
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
                            <Box
                              sx={{
                                overflowY: "auto",
                                maxHeight: { xs: 340, md: 400 }
                              }}
                            >
                              {item?.Placeholders?.filter(
                                (user) => user?.Role !== "prefill"
                              )?.map((user) => (
                                <React.Fragment key={user.Id}>
                                  {isNextStep[user.Id] && (
                                    <Box sx={{ position: "relative" }}>
                                      {actLoader[user.Id] && (
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            bgcolor: "rgba(0,0,0,0.3)",
                                            zIndex: 60
                                          }}
                                        >
                                          <Loader />
                                        </Box>
                                      )}
                                      <Box
                                        component="form"
                                        onSubmit={(e) =>
                                          handleResendMail(e, item, user)
                                        }
                                        sx={{
                                          width: "100%",
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 1,
                                          p: 1.5,
                                          color: "text.primary",
                                          position: "relative"
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            right: 20,
                                            fontSize: "0.75rem",
                                            zIndex: 40
                                          }}
                                        >
                                          <Tooltip
                                            id={`${user.Id}_help`}
                                            message={t("resend-mail-help")}
                                          />
                                        </Box>
                                        <Box
                                          sx={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                            color: "text.primary",
                                            position: "relative"
                                          }}
                                        >
                                          <Box>
                                            <Box
                                              component="label"
                                              htmlFor="mailsubject"
                                              sx={{ fontSize: "0.75rem", ml: 0.5 }}
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
                                              required
                                              inputProps={{
                                                style: { fontSize: "0.75rem" },
                                                onInvalid: (e) =>
                                                  e.target.setCustomValidity(
                                                    t("input-required")
                                                  ),
                                                onInput: (e) =>
                                                  e.target.setCustomValidity("")
                                              }}
                                            />
                                          </Box>
                                          <Box>
                                            <Box
                                              component="label"
                                              htmlFor="mailbody"
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontSize: "0.875rem",
                                                ml: 0.5
                                              }}
                                            >
                                              <span>{t("body")} </span>
                                              <Button
                                                variant="text"
                                                size="small"
                                                onClick={(e) => handleSwitch(e)}
                                              >
                                                {emailEditorType === "basic"
                                                  ? t("switch-to-advanced")
                                                  : t("switch-to-basic")}
                                              </Button>
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
                                        <Button
                                          type="submit"
                                          variant="contained"
                                          sx={{ alignSelf: "flex-start" }}
                                        >
                                          {t("resend")}
                                        </Button>
                                      </Box>
                                    </Box>
                                  )}
                                  {Object?.keys(isNextStep) <= 0 && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 1,
                                        my: 1,
                                        px: 1.5
                                      }}
                                    >
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
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            px: 2,
                            pb: 1.5,
                            pt: 1
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              autoFocus={true}
                              type="text"
                              defaultValue={renameDoc || item.Name}
                              onChange={(e) => setRenameDoc(e.target.value)}
                              inputProps={{
                                maxLength: 200,
                                style: { fontSize: "10px" }
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              gap: 1,
                              pt: 1.5,
                              mt: 1.5,
                              borderTop: "1.5px solid",
                              borderColor: "outline.variant"
                            }}
                          >
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
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {(props.searchLoader || props.List?.length <= 0) && (
            <Box
              sx={{
                height: isDashboard ? 317 : undefined,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                bgcolor: "background.paper",
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
                  <Box
                    sx={{ width: 60, height: 60, overflow: "hidden" }}
                  >
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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            p: 1,
            gap: 0.5
          }}
        >
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
          copyUrlRef={copyUrlRef}
          emailEditorType={emailEditorType}
          setEmailEditorType={setEmailEditorType}
        />
        <ModalUi
          isOpen={isSend}
          title={t(
            utils.mailModalHead(
              templateDetails?.SendinOrder,
              mailStatus,
              currUserId
            )
          )}
          handleClose={() => {
            setIsSend(false);
            navigate("/report/1MwEuxLEkF");
          }}
        >
          <Box sx={{ height: "100%", p: 2.5, color: "text.primary" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2.5
              }}
            >
              <div>
                {mailStatus === "success" ? (
                  <Box sx={{ textAlign: "center", mb: 1.25 }}>
                    <LottieWithLoader />
                    {documentDetails.SendinOrder ? (
                      <p>
                        {currUserId
                          ? t("placeholder-mail-alert-you")
                          : t("placeholder-mail-alert", {
                              name: signerList[0]?.Name
                            })}
                      </p>
                    ) : (
                      <p>{t("placeholder-alert-4")}</p>
                    )}
                  </Box>
                ) : mailStatus === "quotareached" ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 1.5 }}
                  >
                    <Box sx={{ my: 1.5 }}>{handleShareList()}</Box>
                  </Box>
                ) : mailStatus === "failed" ? (
                  <p>{t("mail-failed")} </p>
                ) : mailStatus === "emailnotverified" ? (
                  <p>
                    <Trans
                      i18nKey="email-not-verified-send"
                      components={{
                        1: (
                          <a
                            href="/profile"
                            className="text-blue-700 underline cursor-pointer"
                          />
                        )
                      }}
                    />
                  </p>
                ) : (
                  <Box sx={{ mb: 1.25 }}>
                    {!templateDetails?.SendinOrder &&
                      (mailStatus === "dailyquotareached" ? (
                        <p>{t("daily-quota-reached")}</p>
                      ) : (
                        <p>{t("placeholder-alert-6")}</p>
                      ))}
                    {currUserId && (
                      <Box component="span" sx={{ mt: 0.5 }}>
                        {t("placeholder-alert-5")}
                      </Box>
                    )}
                  </Box>
                )}

                {mailStatus !== "quotareached" && mailStatus !== "failed" && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: mailStatus === "success" ? undefined : "center",
                      mt: mailStatus === "success" ? 0.5 : 3.5
                    }}
                  >
                    {currUserId && (
                      <Button
                        onClick={() => handleRecipientSign(docId, currUserId)}
                        type="button"
                        variant="contained"
                        sx={{ mr: 0.5 }}
                      >
                        {t("sign-now")}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        navigate("/report/1MwEuxLEkF");
                      }}
                      type="button"
                      variant="text"
                      color="inherit"
                    >
                      {currUserId ? t("no") : t("close")}
                    </Button>
                  </Box>
                )}
              </div>
              {mailStatus !== "success" &&
                currUserId &&
                templateDetails?.SendinOrder && (
                  <Divider
                    sx={{
                      width: "100%",
                      my: 0.5,
                      fontWeight: 500,
                      color: "text.primary"
                    }}
                  >
                    {t("or")}
                  </Divider>
                )}

              {mailStatus !== "success" &&
                currUserId &&
                templateDetails?.SendinOrder && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsSend(false);
                      setIsMailModal(true);
                    }}
                    startIcon={
                      <i
                        className="fa-regular fa-envelope"
                        style={{ fontSize: "19px" }}
                      ></i>
                    }
                    sx={{ width: { xs: "50%", md: "35%" }, mt: 0.5 }}
                  >
                    {t("send-to-email")}
                  </Button>
                )}
            </Box>
            {!mailStatus && <Divider sx={{ width: "100%", mt: 1.5 }} />}
          </Box>
        </ModalUi>
        <ModalUi
          title={t(`report-heading.${objInfoModal.title}`)}
          isOpen={objInfoModal.title}
          handleClose={() => setObjInfoModal({ title: "", info: "" })}
        >
          <Box sx={{ p: 2.5 }}>{objInfoModal.info || "-"}</Box>
        </ModalUi>
      </Box>
    </Box>
  );
};

export default TemplatesReport;
