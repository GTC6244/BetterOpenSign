import React, { useRef, useState } from "react";
import PrevNext from "./PrevNext";
import {
  base64ToArrayBuffer,
  decryptPdf,
  deletePdfPage,
  flattenPdf,
  getFileAsArrayBuffer,
  handleDownloadCertificate,
  handleDownloadPdf,
  handleRemoveWidgets,
  handleToPrint,
  reorderPdfPages
} from "../../constant/Utils";
import "../../styles/signature.css";
import { DropdownMenu } from "radix-ui";
import ModalUi from "../../primitives/ModalUi";
import Loader from "../../primitives/Loader";
import PageReorderModal from "./PageReorderModal";
import { useTranslation } from "react-i18next";
import { PDFDocument } from "pdf-lib";
import { maxFileSize } from "../../constant/const";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

function Header(props) {
  const { t } = useTranslation();
  const isMobile = window.innerWidth < 767;
  const [isDownloading, setIsDownloading] = useState("");
  const [isDeletePage, setIsDeletePage] = useState(false);
  const [isReorderModal, setIsReorderModal] = useState(false);
  const mergePdfInputRef = useRef(null);
  const enabledBackBtn = props?.disabledBackBtn === true ? false : true;
  const isViewerSigner = false;
  const finishLabel = t("finish");
  //function for show decline alert
  const handleDeclinePdfAlert = async () => {
    if (props?.handleDecline) {
      props.handleDecline();
    } else {
      const currentDecline = { currnt: "Sure", isDeclined: true };
      props?.setIsDecline(currentDecline);
    }
  };
  const handleDetelePage = async () => {
    props?.setIsUploadPdf && props?.setIsUploadPdf(true);
    const pdfupdatedData = await deletePdfPage(
      props?.pdfArrayBuffer,
      props?.pageNumber
    );
    if (pdfupdatedData?.totalPages === 1) {
      alert(t("delete-alert"));
    } else {
      props?.setPdfBase64Url(pdfupdatedData.base64);
      props?.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
      setIsDeletePage(false);
      handleRemoveWidgets(
        props?.setSignerPos,
        props?.signerPos,
        props?.pageNumber
      );
    }
  };

  // `removeFile` is used to  remove file if exists
  const removeFile = (e) => {
    if (e) {
      e.target.value = "";
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert(t("please-select-pdf"));
      return;
    }
    if (!file.type.includes("pdf")) {
      alert(t("only-pdf-allowed"));
      return;
    }
    const fileSize =
      maxFileSize;
    const pdfsize = file?.size;
    const fileSizeBytes = fileSize * 1024 * 1024;
    if (pdfsize > fileSizeBytes) {
      alert(`${t("file-alert-1")} ${fileSize} MB`);
      removeFile(e);
      return;
    }
    try {
      let uploadedPdfBytes = await file.arrayBuffer();
      try {
        uploadedPdfBytes = await flattenPdf(uploadedPdfBytes);
      } catch (err) {
        if (err?.message?.includes("is encrypted")) {
          try {
            const pdfFile = await decryptPdf(file, "");
            const pdfArrayBuffer = await getFileAsArrayBuffer(pdfFile);
            uploadedPdfBytes = await flattenPdf(pdfArrayBuffer);
          } catch (err) {
            if (err?.response?.status === 401) {
              const password = prompt(
                `PDF "${file.name}" is password-protected. Enter password:`
              );
              if (password) {
                try {
                  const pdfFile = await decryptPdf(file, password);
                  const pdfArrayBuffer = await getFileAsArrayBuffer(pdfFile);
                  uploadedPdfBytes = await flattenPdf(pdfArrayBuffer);
                  // Upload the file to Parse Server
                } catch (err) {
                  console.error("Incorrect password or decryption failed", err);
                  alert(t("incorrect-password-or-decryption-failed"));
                }
              } else {
                alert(t("provide-password"));
              }
            } else {
              console.log("Err ", err);
              alert(t("error-uploading-pdf"));
            }
          }
        } else {
          alert(t("error-uploading-pdf"));
        }
      }
      const uploadedPdfDoc = await PDFDocument.load(uploadedPdfBytes, {
        ignoreEncryption: true
      });
      const basePdfDoc = await PDFDocument.load(props.pdfArrayBuffer);

      // Copy pages from the uploaded PDF to the base PDF
      const uploadedPdfPages = await basePdfDoc.copyPages(
        uploadedPdfDoc,
        uploadedPdfDoc.getPageIndices()
      );
      uploadedPdfPages.forEach((page) => basePdfDoc.addPage(page));
      // Save the updated PDF
      const pdfBase64 = await basePdfDoc.saveAsBase64({
        useObjectStreams: false
      });
      const pdfBuffer = base64ToArrayBuffer(pdfBase64);
      const pdfsize = pdfBuffer?.byteLength;
      const fileSizeBytes = fileSize * 1024 * 1024;
      if (pdfsize > fileSizeBytes) {
        alert(`${t("file-alert-1")} ${fileSize} MB`);
        removeFile(e);
        return;
      }
      props.setPdfArrayBuffer(pdfBuffer);
      props.setPdfBase64Url(pdfBase64);
      props.setIsUploadPdf && props.setIsUploadPdf(true);
      mergePdfInputRef.current.value = "";
    } catch (error) {
      mergePdfInputRef.current.value = "";
      console.error("Error merging PDF:", error);
    }
  };

  const handleReorderSave = async (order) => {
    try {
      const pdfupdatedData = await reorderPdfPages(props.pdfArrayBuffer, order);
      if (pdfupdatedData) {
        props.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
        props.setPdfBase64Url(pdfupdatedData.base64);
        props.setAllPages(pdfupdatedData.totalPages);
        props.setPageNumber(1);
      }
    } catch (e) {
      console.log("error in reorder pdf pages", e);
    }
    setIsReorderModal(false);
  };

  const handleDownloadDoc = async () => {
    await handleDownloadPdf(
      props?.pdfDetails,
      setIsDownloading,
      props.pdfBase64
    );
  };
  const handleDownloadBtn = async () => {
    if (
      props?.isCompleted
    ) {
      props?.setIsDownloadModal(true);
    } else {
      await handleDownloadDoc();
    }
  };
  return (
    <div className="flex py-[5px]">
      {isMobile && props?.isShowHeader ? (
        <div
          id="navbar"
          className="stickyHead touch-none"
          style={{
            width: window.innerWidth + "px"
          }}
        >
          <div className="flex justify-between items-center py-[5px] pl-[10px] ">
            <div onClick={() => window.history.go(-2)}>
              <Box
                component="i"
                className="fa-light fa-arrow-left"
                aria-hidden="true"
                sx={{ color: "text.primary" }}
              ></Box>
            </div>
            <PrevNext
              pageNumber={props?.pageNumber}
              allPages={props?.allPages}
              changePage={props?.changePage}
            />
            {props?.isCompleted || props?.alreadySign ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Box
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: 600,
                      px: 1.5,
                      cursor: "pointer"
                    }}
                  >
                    <i
                      className="fa-light fa-ellipsis-v"
                      aria-hidden="true"
                    ></i>
                  </Box>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="DropdownMenuItem"
                      onClick={() => handleDownloadBtn()}
                    >
                      <div className="flex flex-row">
                        <i
                          className="fa-light fa-arrow-down mr-[3px]"
                          aria-hidden="true"
                        ></i>
                        {t("download")}
                      </div>
                    </DropdownMenu.Item>
                    {
                        props?.isCompleted && (
                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() =>
                              handleDownloadCertificate(
                                props?.pdfDetails,
                                setIsDownloading
                              )
                            }
                          >
                            <Box sx={{ display: "flex", flexDirection: "row" }}>
                              <i
                                className="fa-light fa-award mr-[3px]"
                                aria-hidden="true"
                              ></i>
                              {t("certificate")}
                            </Box>
                          </DropdownMenu.Item>
                        )
                    }
                    {props?.isSignYourself && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() => props?.setIsEmail(true)}
                      >
                        <div className="flex flex-row">
                          <i
                            className="fa-light fa-envelope mr-[3px]"
                            aria-hidden="true"
                          ></i>
                          {t("mail")}
                        </div>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      className="DropdownMenuItem"
                      onClick={(e) =>
                        handleToPrint(e, setIsDownloading, props?.pdfDetails)
                      }
                    >
                      <div className="flex flex-row">
                        <i
                          className="fa-light fa-print mr-[3px]"
                          aria-hidden="true"
                        ></i>
                        {t("print")}
                      </div>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex justify-around items-center">
                {/* current signer is checking user send request and check status of pdf sign than if current 
                user exist than show finish button else no
                */}
                {props?.currentSigner && (
                  <div className="flex items-center" data-tut="reactourFifth">
                    {props?.decline && !isViewerSigner && (
                      <Box
                        onClick={() => handleDeclinePdfAlert()}
                        sx={{
                          color: "error.main",
                          fontWeight: 650,
                          fontSize: "14px",
                          mr: 1,
                          cursor: "pointer"
                        }}
                      >
                        {t("decline")}
                      </Box>
                    )}
                    {props?.isPlaceholder ? (
                      <Box
                        onClick={() => {
                          if (!props?.isMailSend) {
                            props?.handleSaveDoc();
                          }
                        }}
                        sx={{
                          color: props?.isMailSend ? "inherit" : "primary.main",
                          textDecoration: "none",
                          fontWeight: 650,
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                        data-tut="headerArea"
                      >
                        {props?.completeBtnTitle
                          ? props?.completeBtnTitle
                          : t("send")}
                      </Box>
                    ) : (
                      !isViewerSigner && (
                        <Box
                          data-tut="reactourThird"
                          onClick={() => props?.embedWidgetsData()}
                          sx={{
                            color: "primary.main",
                            textDecoration: "none",
                            fontWeight: 650,
                            fontSize: "14px",
                            cursor: "pointer"
                          }}
                        >
                          {finishLabel}
                        </Box>
                      )
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      ref={mergePdfInputRef}
                      onChange={handleFileUpload}
                    />
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Box
                          sx={{
                            fontWeight: 650,
                            fontSize: "18px",
                            px: 1.5,
                            color: "text.primary",
                            textDecoration: "none",
                            cursor: "pointer"
                          }}
                        >
                          <i
                            className="fa-light fa-ellipsis-v"
                            aria-hidden="true"
                          ></i>
                        </Box>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="bg-white shadow-md rounded-md px-3 py-2"
                          sideOffset={5}
                        >
                          {props?.setIsEditTemplate && (
                            <DropdownMenu.Item
                              className="DropdownMenuItem"
                              onClick={() => props?.setIsEditTemplate(true)}
                            >
                              <div className="flex flex-row">
                                <i
                                  className="fa-light fa-gear mr-[3px]"
                                  aria-hidden="true"
                                ></i>
                                <span className="font-[500]">{t("Edit")}</span>
                              </div>
                            </DropdownMenu.Item>
                          )}
                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() => handleDownloadDoc()}
                          >
                            <div className="flex flex-row">
                              <i
                                className="fa-light fa-arrow-down mr-[3px]"
                                aria-hidden="true"
                              ></i>
                              <span className="font-[500]">
                                {t("download")}
                              </span>
                            </div>
                          </DropdownMenu.Item>
                          {!props?.isDisablePdfEditTools && (
                            <>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => mergePdfInputRef.current.click()}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-plus text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("add-pages")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => setIsDeletePage(true)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-trash text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("delete-page")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => setIsReorderModal(true)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-list-ol text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("reorder-pages")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>

                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => props?.handleRotationFun(90)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-rotate-right text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("rotate-right")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => props?.handleRotationFun(-90)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-rotate-left text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("rotate-left")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                            </>
                          )}

                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() => props?.clickOnZoomIn()}
                          >
                            <div className="flex flex-row">
                              <i className="fa-light fa-magnifying-glass-plus text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                              <span className="font-[500]">{t("zoom-in")}</span>
                            </div>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() => props?.clickOnZoomOut()}
                          >
                            <div className="flex flex-row">
                              <i className="fa-light fa-magnifying-glass-minus text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                              <span className="font-[500]">
                                {t("zoom-out")}
                              </span>
                            </div>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                )}
                {props?.isPublicTemplate && (
                  <Box
                    data-tut="reactourThird"
                    onClick={() => props?.embedWidgetsData()}
                    sx={{
                      fontWeight: 650,
                      fontSize: "14px",
                      pr: 1,
                      color: "primary.main",
                      textDecoration: "none",
                      cursor: "pointer"
                    }}
                  >
                    {t("sign-now")}
                  </Box>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-between items-center w-full gap-y-1 ml-1">
          <PrevNext
            pageNumber={props?.pageNumber}
            allPages={props?.allPages}
            changePage={props?.changePage}
          />
          {props?.isPlaceholder ? (
            <>
              <div className="flex mx-[100px] lg:mx-0 order-last lg:order-none"></div>
              <div className="flex">
                {props?.setIsEditTemplate && (
                  <Button
                    onClick={() => props?.setIsEditTemplate(true)}
                    variant="text"
                    color="inherit"
                    sx={{ minWidth: 0, textAlign: "center", mr: "3px", color: "text.primary" }}
                  >
                    <i className="fa-light fa-gear fa-lg"></i>
                  </Button>
                )}
                {enabledBackBtn && (
                  <Button
                    onClick={() => window.history.go(-2)}
                    type="button"
                    variant="text"
                    color="inherit"
                    size="small"
                    sx={{ mr: "3px", color: "text.primary" }}
                  >
                    {t("back")}
                  </Button>
                )}
                <Button
                  disabled={props?.isMailSend && true}
                  data-tut="headerArea"
                  variant="contained"
                  size="small"
                  sx={{ mr: "3px" }}
                  onClick={() => props?.handleSaveDoc()}
                >
                  {props?.completeBtnTitle
                    ? props?.completeBtnTitle
                    : props?.isMailSend
                      ? t("sent")
                      : t("send")}
                </Button>
              </div>
            </>
          ) : props?.isPdfRequestFiles || props?.isSelfSign ? (
            props?.alreadySign || (props?.isSelfSign && props?.isCompleted) ? (
              <div className="flex flex-row">
                <Button
                  onClick={(e) =>
                    handleToPrint(e, setIsDownloading, props?.pdfDetails)
                  }
                  type="button"
                  variant="contained"
                  color="inherit"
                  size="small"
                  sx={{ mr: "3px" }}
                >
                  <i
                    className="fa-light fa-print py-[3px]"
                    aria-hidden="true"
                  ></i>
                  <span className="hidden lg:block">{t("print")}</span>
                </Button>
                {
                    props?.isCompleted && (
                      <Button
                        type="button"
                        onClick={() =>
                          handleDownloadCertificate(
                            props?.pdfDetails,
                            setIsDownloading
                          )
                        }
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{ mr: "3px" }}
                      >
                        <i
                          className="fa-light fa-award py-[3px]"
                          aria-hidden="true"
                        ></i>
                        <span className="hidden lg:block">
                          {t("certificate")}
                        </span>
                      </Button>
                    )
                }
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  sx={{ mr: "3px" }}
                  onClick={() => handleDownloadBtn()}
                >
                  <i
                    className="fa-light fa-download py-[3px]"
                    aria-hidden="true"
                  ></i>
                  <span className="hidden lg:block">{t("download")}</span>
                </Button>
              </div>
            ) : (
              <div className="flex" data-tut="reactourFifth">
                {props?.currentSigner && (
                  <>
                    {props?.templateId && (
                      <Button
                        onClick={() => handleDownloadDoc()}
                        type="button"
                        variant="text"
                        color="inherit"
                        size="small"
                        sx={{ mr: "3px", color: "text.primary" }}
                      >
                        <span className="hidden lg:block">{t("download")}</span>
                      </Button>
                    )}
                    {!props?.isSelfSign && !isViewerSigner && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{ mr: "3px" }}
                        onClick={() => handleDeclinePdfAlert()}
                      >
                        {t("decline")}
                      </Button>
                    )}
                    {!props?.templateId && (
                      <Button
                        type="button"
                        variant="text"
                        color="inherit"
                        size="small"
                        sx={{ mr: "3px", color: "text.primary" }}
                        onClick={() => handleDownloadDoc()}
                      >
                        <i className="fa-light fa-arrow-down font-semibold lg:hidden"></i>
                        <span className="hidden lg:block">{t("download")}</span>
                      </Button>
                    )}
                    {!isViewerSigner && (
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        sx={{ mr: "3px" }}
                        onClick={() => props?.embedWidgetsData()}
                      >
                        {finishLabel}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )
          ) : props?.isCompleted ? (
            <div className="flex flex-row">
              {
                  props?.isCompleted && (
                    <Button
                      type="button"
                      onClick={() =>
                        handleDownloadCertificate(
                          props?.pdfDetails,
                          setIsDownloading
                        )
                      }
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ gap: 0, fontWeight: 500, fontSize: "12px", mr: "3px" }}
                    >
                      <i className="fa-light fa-award" aria-hidden="true"></i>
                      <span className="hidden lg:block ml-1">
                        {t("certificate")}
                      </span>
                    </Button>
                  )
              }
              <Button
                onClick={(e) =>
                  handleToPrint(e, setIsDownloading, props?.pdfDetails)
                }
                type="button"
                variant="contained"
                color="inherit"
                size="small"
                sx={{ gap: 0, fontWeight: 500, fontSize: "12px", mr: "3px" }}
              >
                <i className="fa-light fa-print" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("print")}</span>
              </Button>
              <Button
                type="button"
                variant="contained"
                size="small"
                sx={{ gap: 0, fontWeight: 500, fontSize: "12px", mr: "3px" }}
                // onClick={() => props?.setIsDownloadModal(true)}
                onClick={() => handleDownloadBtn()}
              >
                <i className="fa-light fa-download" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("download")}</span>
              </Button>
              <Button
                type="button"
                variant="contained"
                color="info"
                size="small"
                sx={{ gap: 0, fontWeight: 500, fontSize: "12px", mr: "3px" }}
                onClick={() => props?.setIsEmail(true)}
              >
                <i className="fa-light fa-envelope" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("mail")}</span>
              </Button>
            </div>
          ) : props?.isPublicTemplate ? (
            <div className="flex">
              <Button
                type="button"
                variant="contained"
                size="small"
                onClick={() => props?.embedWidgetsData()}
              >
                {t("sign-now")}
              </Button>
            </div>
          ) : (
            <div className="flex">
              <Button
                onClick={() => window.history.go(-2)}
                type="button"
                variant="text"
                color="inherit"
                size="small"
                sx={{ mr: "3px", color: "text.primary" }}
              >
                {t("back")}
              </Button>
              <Button
                type="button"
                variant="contained"
                size="small"
                sx={{ mr: "3px" }}
                onClick={() => props?.embedWidgetsData()}
              >
                {finishLabel}
              </Button>
            </div>
          )}
        </div>
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
      <ModalUi
        isOpen={
          isDownloading === "certificate" || isDownloading === "certificate_err"
        }
        title={
          isDownloading === "certificate" || isDownloading === "certificate_err"
            ? t("generating-certificate")
            : t("pdf-download")
        }
        handleClose={() => setIsDownloading("")}
      >
        <Box
          sx={{
            p: { xs: 1.5, md: 2.5 },
            fontSize: { xs: "13px", md: "1rem" },
            textAlign: "center",
            color: "text.primary"
          }}
        >
          {isDownloading === "certificate" ? (
            <p>{t("generate-certificate-alert")}</p>
          ) : (
            <p>{t("generate-certificate-err")}</p>
          )}
        </Box>
      </ModalUi>
      <ModalUi
        isOpen={isDeletePage}
        title={t("delete-page")}
        handleClose={() => setIsDeletePage(false)}
      >
        <Box sx={{ height: "100%", p: 2.5 }}>
          <Typography sx={{ fontWeight: 500, color: "text.primary" }}>
            {t("delete-alert-2")}
          </Typography>
          <Typography sx={{ pt: 1.5, color: "text.primary" }}>
            {t("delete-note")}
          </Typography>
          <Divider sx={{ my: 1.875 }} />
          <Button
            onClick={() => handleDetelePage()}
            type="button"
            variant="contained"
          >
            {t("yes")}
          </Button>
          <Button
            onClick={() => setIsDeletePage(false)}
            type="button"
            variant="text"
            color="inherit"
            sx={{ color: "text.primary" }}
          >
            {t("no")}
          </Button>
        </Box>
      </ModalUi>
      <PageReorderModal
        isOpen={isReorderModal}
        handleClose={() => setIsReorderModal(false)}
        totalPages={props.allPages}
        onSave={handleReorderSave}
      />
    </div>
  );
}

export default Header;
