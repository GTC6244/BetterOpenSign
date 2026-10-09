import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Confetti from "react-confetti"; // Import the confetti library
import {
  getBase64FromUrl,
  handleDownloadCertificate,
  handleDownloadPdf,
  handleToPrint,
} from "../constant/Utils";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import DownloadPdfZip from "../primitives/DownloadPdfZip";
import CheckCircle from "../primitives/CheckCircle";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const DocSuccessPage = () => {
  const { t } = useTranslation();
  const signed = window.location?.search?.includes("docid");
  const sent = window.location?.search?.includes("message");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [pdfDetails, setPdfDetails] = useState([]);
  const [pdfBase64Url, setPdfBase64Url] = useState("");
  const [showConfetti, setShowConfetti] = useState(true); // State to control confetti

  useEffect(() => {
    initialsetup();
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const initialsetup = async () => {
    const search = window.location.search.split("?")[1];
    if (search) {
      const urlParams = new URLSearchParams(search);
      const docId = urlParams.get("docid");
      const docUrl = urlParams.get("docurl");
      const certificate = urlParams.get("certificate");
      const completed = urlParams?.get("completed") || false;
      const details = {
        objectId: docId,
        SignedUrl: docUrl,
        CertificateUrl: certificate,
        IsCompleted: completed,
      };
      setPdfDetails([details]);
      const base64Pdf = await getBase64FromUrl(docUrl);
      if (base64Pdf) {
        setPdfBase64Url(base64Pdf);
      }
    }
  };

  const handleDownload = () => {
    if (
      pdfDetails?.[0]?.IsCompleted
    ) {
      setIsDownloadModal(true);
    } else {
      handleDownloadPdf(pdfDetails, setIsDownloading, pdfBase64Url);
    }
  };

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      {sent ? (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 1.5, md: 4 },
            textAlign: "center"
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: "32rem", md: "42rem" },
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 6,
              p: { xs: 1.5, md: 5 }
            }}
          >
            {t("doc-sent")}
          </Box>
        </Box>
      ) : signed ? (
        <>
          <Box
            sx={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 1.5, md: 4 },
              textAlign: "center"
            }}
          >
            <Box
              sx={{
                maxWidth: { xs: "32rem", md: "42rem" },
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 6,
                p: { xs: 1.5, md: 5 }
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2
                }}
              >
                <CheckCircle color="success.main" size={56} />
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                    fontWeight: 600,
                    color: "text.primary"
                  }}
                >
                  {pdfDetails?.[0]?.IsCompleted
                    ? t("document-has-been-signed")
                    : t("document-has-been-signed-by-you")}
                </Typography>
                {pdfDetails?.[0]?.IsCompleted && (
                  <Typography
                    sx={{
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      color: "text.secondary"
                    }}
                  >
                    {t("participant-completed-signing")}
                  </Typography>
                )}
              </Box>
              {/* Action Buttons */}
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1
                }}
              >
                <Button
                  type="button"
                  variant="contained"
                  onClick={() => handleDownload()}
                  startIcon={
                    <i className="fa-light fa-download" aria-hidden="true"></i>
                  }
                >
                  {t("download")}
                </Button>

                {pdfDetails?.[0]?.IsCompleted && (
                  <Button
                    type="button"
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      handleDownloadCertificate(pdfDetails, setIsDownloading)
                    }
                    startIcon={
                      <i className="fa-light fa-award" aria-hidden="true"></i>
                    }
                  >
                    {t("certificate")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="contained"
                  color="inherit"
                  onClick={(e) =>
                    handleToPrint(e, setIsDownloading, pdfDetails)
                  }
                  startIcon={
                    <i className="fa-light fa-print" aria-hidden="true"></i>
                  }
                >
                  {t("print")}
                </Button>
              </Box>
              {/* Footer Message */}
              <Typography
                sx={{
                  mt: { xs: 2, md: 3 },
                  fontSize: { xs: "0.75rem", md: "0.875rem" },
                  color: "text.secondary"
                }}
              >
                {t("you-will-receive-email-shortly")}
              </Typography>
            </Box>
          </Box>
          {isDownloading === "pdf" && (
            <Box
              sx={{
                position: "fixed",
                zIndex: 1000,
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
              isDownloading === "certificate" ||
              isDownloading === "certificate_err"
            }
            title={
              isDownloading === "certificate" ||
              isDownloading === "certificate_err"
                ? t("generating-certificate")
                : t("pdf-download")
            }
            handleClose={() => setIsDownloading("")}
          >
            <Box
              sx={{
                p: { xs: 1.5, md: 2.5 },
                fontSize: { xs: "0.875rem", md: "1rem" },
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
          <DownloadPdfZip
            setIsDownloadModal={setIsDownloadModal}
            isDownloadModal={isDownloadModal}
            pdfDetails={pdfDetails}
            isDocId={true}
            pdfBase64={pdfBase64Url}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default DocSuccessPage;
